// Add an expense: once per clientId; a matching expense from someone else is flagged as a likely repeat
import "server-only";
import { and, eq, isNull, ne } from "drizzle-orm";
import type { Executor } from "@/db";
import { expenseCategories, expenses, sets } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { unprocessable } from "@/server/errors";
import type { ExpenseCreate } from "@/schemas/expense";
import type { SessionUser } from "@/types/session";

export type CreateMeta = { deviceId?: string | null };

export async function createExpense(db: Executor, input: ExpenseCreate, actor: SessionUser, meta: CreateMeta = {}) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(expenses).where(eq(expenses.clientId, input.clientId));
    if (existing) return { expense: existing, created: false };
    const [category] = await tx.select().from(expenseCategories).where(and(eq(expenseCategories.id, input.categoryId), isNull(expenseCategories.deletedAt)));
    if (!category) throw unprocessable("Choose a category.");
    if (input.capitalItem && !category.isCapitalEligible) throw unprocessable(`${category.name} can't be a capital item.`);
    if (input.setId) {
      const [set] = await tx.select({ id: sets.id }).from(sets).where(and(eq(sets.id, input.setId), isNull(sets.deletedAt)));
      if (!set) throw unprocessable("That Set wasn't found. Choose another.");
    }
    const { enteredOfflineAt, ...fields } = input;
    // Same day, category, amount and Set (or both overhead), entered separately: probably the same spend twice
    const [twin] = await tx
      .select({ id: expenses.id })
      .from(expenses)
      .where(
        and(
          isNull(expenses.deletedAt),
          eq(expenses.date, input.date),
          eq(expenses.categoryId, input.categoryId),
          eq(expenses.amount, input.amount),
          input.setId ? eq(expenses.setId, input.setId) : eq(expenses.overhead, true),
          ne(expenses.clientId, input.clientId),
        ),
      )
      .limit(1);
    const [expense] = await tx
      .insert(expenses)
      .values({ ...fields, paidByUserId: fields.paidByUserId ?? actor.id, createdBy: actor.id, possibleDuplicateOf: twin?.id ?? null })
      .returning();
    const offlineAt = enteredOfflineAt ? new Date(enteredOfflineAt) : null;
    await recordCreate(tx, "expenses", expense!.id, { userId: actor.id, deviceId: meta.deviceId, enteredOfflineAt: offlineAt });
    return { expense: expense!, created: true };
  });
}
