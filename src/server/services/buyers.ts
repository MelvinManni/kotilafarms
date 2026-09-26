// Buyers: list with what they bought and owe, and add a buyer
import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { buyers } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { conflict } from "@/server/errors";
import { saleRows } from "@/server/services/sales/rows";
import type { BuyerCreate } from "@/schemas/sale";
import type { BuyerRow } from "@/types/sale";
import type { SessionUser } from "@/types/session";
import { getSetting } from "@/server/services/settings";
import { queries } from "@/server/queries";
import { buyerInsight } from "@/utils/metrics/buyer-insight";

export async function listBuyers(db: Executor, today: string): Promise<BuyerRow[]> {
  const [rows, sales, bulkRate] = await queries(db, [() => db.select().from(buyers).where(isNull(buyers.deletedAt)).orderBy(asc(buyers.name)), () => saleRows(db, [], today), () => getSetting<number>(db, "bulkRatePerBird")]);
  return rows.map((b) => {
    const mine = sales.filter((s) => s.buyer.id === b.id);
    const x = buyerInsight(mine, bulkRate, today);
    return { id: b.id, name: b.name, phone: b.phone, note: b.note, birds: x.birds, spent: x.total, balance: x.owed, averagePrice: x.averagePrice, vsBulk: x.vsBulk, lastSale: mine[0]?.date ?? null };
  });
}

export async function createBuyer(db: Executor, input: BuyerCreate, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(buyers).where(eq(buyers.clientId, input.clientId));
    if (existing) return existing;
    const [sameName] = await tx.select({ id: buyers.id }).from(buyers).where(and(isNull(buyers.deletedAt), eq(buyers.name, input.name)));
    if (sameName) throw conflict(`${input.name} is already a buyer. Choose them from the list.`);
    const [row] = await tx.insert(buyers).values({ ...input, createdBy: actor.id }).returning();
    await recordCreate(tx, "buyers", row!.id, { userId: actor.id });
    return row!;
  });
}
