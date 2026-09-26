// Drugs and supplements given: saved once per clientId; a cost becomes a Drugs and vaccines expense on the Set
import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { healthRecords, sets, users } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { notFound, unprocessable } from "@/server/errors";
import { createExpense } from "@/server/services/expenses/create";
import { categoryIdByKey } from "@/server/services/expenses/category-by-key";
import type { HealthRecordCreate } from "@/schemas/health";
import type { HealthRecordRow } from "@/types/health";
import type { SessionUser } from "@/types/session";

export async function createHealthRecord(db: Executor, input: HealthRecordCreate, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(healthRecords).where(eq(healthRecords.clientId, input.clientId));
    if (existing) return { record: existing, created: false };
    const [set] = await tx.select().from(sets).where(and(eq(sets.id, input.setId), isNull(sets.deletedAt)));
    if (!set) throw notFound("That Set");
    if (input.date < set.startDate || input.date > today) throw unprocessable("Choose a day between the Set's start and today.");
    const expense = input.cost
      ? (await createExpense(tx, { clientId: crypto.randomUUID(), date: input.date, categoryId: await categoryIdByKey(tx, "drugs"), description: `${input.item}, ${input.dose}`, amount: input.cost, setId: set.id, overhead: false, capitalItem: false }, actor)).expense
      : null;
    const [record] = await tx.insert(healthRecords).values({ clientId: input.clientId, setId: set.id, date: input.date, item: input.item, dose: input.dose, cost: input.cost || null, reason: input.reason, expenseId: expense?.id ?? null, createdBy: actor.id }).returning();
    await recordCreate(tx, "health_records", record!.id, { userId: actor.id });
    return { record: record!, created: true };
  });
}

export async function listHealthRecords(db: Executor, setId?: string): Promise<HealthRecordRow[]> {
  const rows = await db
    .select({ r: healthRecords, setNumber: sets.number, by: users.name })
    .from(healthRecords)
    .innerJoin(sets, eq(sets.id, healthRecords.setId))
    .innerJoin(users, eq(users.id, healthRecords.createdBy))
    .where(and(isNull(healthRecords.deletedAt), setId ? eq(healthRecords.setId, setId) : undefined))
    .orderBy(desc(healthRecords.date), desc(healthRecords.createdAt));
  return rows.map(({ r, setNumber, by }) => ({ id: r.id, date: r.date, set: { id: r.setId, number: setNumber }, item: r.item, dose: r.dose, cost: r.cost, reason: r.reason, by, enteredAt: r.createdAt.toISOString() }));
}
