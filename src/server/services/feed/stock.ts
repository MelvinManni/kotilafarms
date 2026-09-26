// Stock per feed type (bought − used), daily rate, days left, who is eating it, and last price
import "server-only";
import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs, feedPurchases, sets } from "@/db/schema";
import { listFeedTypes } from "@/server/services/feed-types";
import { queries } from "@/server/queries";
import type { FeedStockPayload } from "@/types/feed";
import { feedName } from "@/utils/format/feed-name";
import { feedStock, toBags } from "@/utils/metrics/feed-stock";

export async function feedStockFor(db: Executor, today: string): Promise<FeedStockPayload> {
  const [types, purchases, uses, setRows] = await queries(db, [
    () => listFeedTypes(db, true),
    () => db.select({ feedTypeId: feedPurchases.feedTypeId, bags: feedPurchases.bags, price: feedPurchases.pricePerBag }).from(feedPurchases).where(isNull(feedPurchases.deletedAt)).orderBy(asc(feedPurchases.date), asc(feedPurchases.createdAt)),
    () => db.select({ feedTypeId: dailyLogs.feedTypeId, date: dailyLogs.date, setId: dailyLogs.setId, qty: dailyLogs.feedQty, unit: dailyLogs.feedUnit }).from(dailyLogs).where(and(isNull(dailyLogs.deletedAt), isNotNull(dailyLogs.feedTypeId), isNotNull(dailyLogs.feedQty))),
    () => db.select({ id: sets.id, number: sets.number, intake: sets.intake, status: sets.status }).from(sets).where(isNull(sets.deletedAt)).orderBy(desc(sets.closedOn)),
  ]);
  const setsById = new Map(setRows.map((s) => [s.id, s]));
  const rows = types
    .map((t) => {
      const mine = uses.filter((u) => u.feedTypeId === t.id).map((u) => ({ date: u.date, setId: u.setId, qty: u.qty!, unit: u.unit }));
      const bought = purchases.filter((p) => p.feedTypeId === t.id);
      const s = feedStock(bought.map((p) => p.bags), mine, t.kgPerBag, today);
      return {
        feedTypeId: t.id, feed: feedName(t), kind: t.kind, stockBags: s.stockBags, bagsPerDay: s.bagsPerDay, daysLeft: s.daysLeft,
        eating: s.eatingSetIds.map((id) => setsById.get(id)).filter((x) => x !== undefined).map((x) => ({ id: x.id, number: x.number })),
        lastPrice: bought.at(-1)?.price ?? null,
        active: t.active,
      };
    })
    .filter((r) => r.active || r.stockBags !== 0)
    .map(({ active: _a, ...r }) => r);
  // Bags a 500-bird Set eats, from the latest closed Set that logged its feed
  const kgPerBag = new Map(types.map((t) => [t.id, t.kgPerBag]));
  const closed = setRows.find((s) => s.status === "closed" && uses.some((u) => u.setId === s.id));
  const closedBags = closed ? uses.filter((u) => u.setId === closed.id).reduce((a, u) => a + toBags({ qty: u.qty!, unit: u.unit }, kgPerBag.get(u.feedTypeId!) ?? 25), 0) : 0;
  return { rows, bagsPer500Birds: closed ? Math.round((closedBags / closed.intake) * 500) : null };
}

export async function feedPrices(db: Executor, feedTypeId: string) {
  return db.select({ date: feedPurchases.date, pricePerBag: feedPurchases.pricePerBag, supplier: feedPurchases.supplier }).from(feedPurchases).where(and(eq(feedPurchases.feedTypeId, feedTypeId), isNull(feedPurchases.deletedAt))).orderBy(asc(feedPurchases.date), asc(feedPurchases.createdAt));
}
