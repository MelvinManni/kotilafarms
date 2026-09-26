// Expense categories: list, add, rename (the ten from the spec come from db:setup)
import "server-only";
import { randomUUID } from "node:crypto";
import { asc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { expenseCategories } from "@/db/schema";
import { recordChange, recordCreate } from "@/server/audit";
import { notFound } from "@/server/errors";
import type { SessionUser } from "@/types/session";

export function listCategories(db: Executor) {
  return db
    .select({ id: expenseCategories.id, key: expenseCategories.key, name: expenseCategories.name, isCapitalEligible: expenseCategories.isCapitalEligible })
    .from(expenseCategories)
    .where(isNull(expenseCategories.deletedAt))
    .orderBy(asc(expenseCategories.createdAt));
}

// Keys are made from the name ("Fuel and power" → fuel_and_power), with a suffix if taken
const toKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "category";

export async function addCategory(db: Executor, input: { name: string; isCapitalEligible: boolean }, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const taken = new Set((await tx.select({ key: expenseCategories.key }).from(expenseCategories)).map((r) => r.key));
    let key = toKey(input.name);
    for (let n = 2; taken.has(key); n++) key = `${toKey(input.name)}_${n}`;
    const [row] = await tx.insert(expenseCategories).values({ ...input, key, clientId: randomUUID(), createdBy: actor.id }).returning();
    await recordCreate(tx, "expense_categories", row!.id, { userId: actor.id });
    return row!;
  });
}

export async function updateCategory(db: Executor, id: string, input: { name?: string; isCapitalEligible?: boolean }, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    if (!before) throw notFound("That category");
    const [after] = await tx.update(expenseCategories).set(input).where(eq(expenseCategories.id, id)).returning();
    await recordChange(tx, { table: "expense_categories", rowId: id, before, after: input, userId: actor.id });
    return after!;
  });
}
