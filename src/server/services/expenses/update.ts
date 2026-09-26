// Change or remove an expense: version check, reason for late amount changes, audit per field
import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { Executor } from "@/db";
import { expenseCategories, expenses } from "@/db/schema";
import { recordChange } from "@/server/audit";
import { conflict, notFound, unprocessable } from "@/server/errors";
import type { ExpenseEdit } from "@/schemas/expense";
import type { SessionUser } from "@/types/session";

export async function editExpense(db: Executor, id: string, input: ExpenseEdit, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(expenses).where(and(eq(expenses.id, id), isNull(expenses.deletedAt)));
    if (!before) throw notFound("That expense");
    if (before.version !== input.baseVersion) throw conflict("Someone changed this expense since you opened it. Reload, then try again.");
    const { baseVersion, reason, ...changes } = input;
    if (before.date < today && changes.amount !== undefined && changes.amount !== before.amount && !reason?.trim())
      throw unprocessable("Say why you're changing the amount after the day.");
    const categoryId = changes.categoryId ?? before.categoryId;
    const capital = changes.capitalItem ?? before.capitalItem;
    if (capital) {
      const [category] = await tx.select().from(expenseCategories).where(eq(expenseCategories.id, categoryId));
      if (!category?.isCapitalEligible) throw unprocessable(`${category?.name ?? "This category"} can't be a capital item.`);
    }
    const [after] = await tx.update(expenses).set({ ...changes, version: sql`${expenses.version} + 1` }).where(eq(expenses.id, id)).returning();
    await recordChange(tx, { table: "expenses", rowId: id, before, after: changes, reason: reason ?? null, userId: actor.id });
    return after!;
  });
}

// Owners only (checked in the route); the row stays, marked removed, with the reason
export async function removeExpense(db: Executor, id: string, reason: string, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(expenses).where(and(eq(expenses.id, id), isNull(expenses.deletedAt)));
    if (!before) throw notFound("That expense");
    const deletedAt = new Date();
    await tx.update(expenses).set({ deletedAt, version: sql`${expenses.version} + 1` }).where(eq(expenses.id, id));
    await recordChange(tx, { table: "expenses", rowId: id, before: { deletedAt: null }, after: { deletedAt: deletedAt.toISOString() }, reason, userId: actor.id });
  });
}
