// Build the rows a test needs, inside its own rolled-back transaction (never seeded)
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Tx } from "@/db";
import { breedCurves, expenseCategories, feedTypes, sets, stockTypes } from "@/db/schema";
import { createFirstOwner } from "@/db/setup/create-first-owner";
import { insertReferenceData } from "@/db/setup/insert-reference-data";

export const made = (ownerId: string) => ({ clientId: randomUUID(), createdBy: ownerId });

// Owner + reference lists + one Set: the least a farm record needs
export async function farmWithSet(tx: Tx) {
  const { id: ownerId } = await createFirstOwner(tx, { name: "Test Owner", email: `owner-${randomUUID()}@example.com`, passwordHash: "x" });
  await insertReferenceData(tx, ownerId);
  const [stock] = await tx.select().from(stockTypes).where(eq(stockTypes.key, "broiler"));
  const [curve] = await tx.select().from(breedCurves).limit(1);
  const [set] = await tx
    .insert(sets)
    .values({ ...made(ownerId), stockTypeId: stock!.id, breedCurveId: curve!.id, startDate: "2026-09-02", intake: 500, dayOldSupplier: "Chi Farms", dayOldUnitCost: 950 })
    .returning();
  const [feed] = await tx.insert(feedTypes).values({ ...made(ownerId), kind: "finisher", brand: "Ultima" }).returning();
  const categoryId = async (key: string) => (await tx.select().from(expenseCategories).where(eq(expenseCategories.key, key)))[0]!.id;
  return { ownerId, set: set!, feedTypeId: feed!.id, categoryId };
}
