// Record a sale: once per clientId; never more birds than the Set has alive
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { buyers, sales, sets } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { unprocessable } from "@/server/errors";
import { setTotals } from "@/server/services/sets/aggregates";
import type { SaleCreate } from "@/schemas/sale";
import type { SessionUser } from "@/types/session";
import { liveBirds } from "@/utils/metrics/birds";

export async function createSale(db: Executor, input: SaleCreate, actor: SessionUser, meta: { deviceId?: string | null } = {}) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(sales).where(eq(sales.clientId, input.clientId));
    if (existing) return { sale: existing, created: false };
    const [set] = await tx.select().from(sets).where(and(eq(sets.id, input.setId), isNull(sets.deletedAt)));
    if (!set) throw unprocessable("That Set wasn't found. Choose another.");
    if (input.date < set.startDate) throw unprocessable(`Set ${set.number} started on ${set.startDate}, after this sale.`);
    const [buyer] = await tx.select({ id: buyers.id }).from(buyers).where(and(eq(buyers.id, input.buyerId), isNull(buyers.deletedAt)));
    if (!buyer) throw unprocessable("That buyer wasn't found. Choose another.");
    const totals = (await setTotals(tx, [set.id])).get(set.id)!;
    const live = liveBirds(set.intake, totals.deaths, totals.sold);
    if (input.birds > live) throw unprocessable(`Set ${set.number} has only ${live} live ${live === 1 ? "bird" : "birds"} on the books.`);
    const { enteredOfflineAt, ...fields } = input;
    const [sale] = await tx.insert(sales).values({ ...fields, createdBy: actor.id }).returning();
    await recordCreate(tx, "sales", sale!.id, { userId: actor.id, deviceId: meta.deviceId, enteredOfflineAt: enteredOfflineAt ? new Date(enteredOfflineAt) : null });
    return { sale: sale!, created: true };
  });
}
