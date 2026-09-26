// Manure and droppings: just an amount against a Set
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { otherSales, sets } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { unprocessable } from "@/server/errors";
import type { OtherSaleCreate } from "@/schemas/sale";
import type { SessionUser } from "@/types/session";

export async function addOtherSale(db: Executor, input: OtherSaleCreate, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(otherSales).where(eq(otherSales.clientId, input.clientId));
    if (existing) return { row: existing, created: false };
    const [set] = await tx.select({ id: sets.id }).from(sets).where(and(eq(sets.id, input.setId), isNull(sets.deletedAt)));
    if (!set) throw unprocessable("That Set wasn't found. Choose another.");
    const [row] = await tx.insert(otherSales).values({ ...input, createdBy: actor.id }).returning();
    await recordCreate(tx, "other_sales", row!.id, { userId: actor.id });
    return { row: row!, created: true };
  });
}
