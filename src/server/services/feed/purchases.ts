// Feed purchases: saving one (with its Feed expense and a Transport expense) and listing them
import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { expenses, feedPurchases, feedTypes, sets, users } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { unprocessable } from "@/server/errors";
import { createExpense } from "@/server/services/expenses/create";
import { categoryIdByKey } from "@/server/services/expenses/category-by-key";
import type { FeedPurchaseCreate } from "@/schemas/feed";
import type { FeedPurchaseRow } from "@/types/feed";
import type { SessionUser } from "@/types/session";
import { feedName } from "@/utils/format/feed-name";

export async function createFeedPurchase(db: Executor, input: FeedPurchaseCreate, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(feedPurchases).where(eq(feedPurchases.clientId, input.clientId));
    if (existing) return { purchase: existing, created: false };
    const [type] = await tx.select().from(feedTypes).where(and(eq(feedTypes.id, input.feedTypeId), isNull(feedTypes.deletedAt)));
    if (!type) throw unprocessable("That feed wasn't found. Choose another.");
    const name = feedName(type).toLowerCase();
    const attribution = { setId: input.setId, overhead: input.overhead, date: input.date, capitalItem: false };
    const { expense } = await createExpense(tx, { ...attribution, clientId: crypto.randomUUID(), categoryId: await categoryIdByKey(tx, "feed"), description: `${input.bags} bags ${name} · ${input.supplier}`, amount: input.total }, actor);
    const transport = input.transportCost > 0
      ? (await createExpense(tx, { ...attribution, clientId: crypto.randomUUID(), categoryId: await categoryIdByKey(tx, "transport"), description: `Transport for ${input.bags} bags ${name}`, amount: input.transportCost }, actor)).expense
      : null;
    const { setId: _s, overhead: _o, ...fields } = input;
    const [purchase] = await tx.insert(feedPurchases).values({ ...fields, expenseId: expense.id, transportExpenseId: transport?.id ?? null, createdBy: actor.id }).returning();
    await recordCreate(tx, "feed_purchases", purchase!.id, { userId: actor.id });
    return { purchase: purchase!, created: true };
  });
}

export async function listFeedPurchases(db: Executor): Promise<FeedPurchaseRow[]> {
  const rows = await db
    .select({ p: feedPurchases, type: feedTypes, setId: sets.id, setNumber: sets.number, by: users.name })
    .from(feedPurchases)
    .innerJoin(feedTypes, eq(feedTypes.id, feedPurchases.feedTypeId))
    .innerJoin(expenses, eq(expenses.id, feedPurchases.expenseId))
    .leftJoin(sets, eq(sets.id, expenses.setId))
    .innerJoin(users, eq(users.id, feedPurchases.createdBy))
    .where(isNull(feedPurchases.deletedAt))
    .orderBy(desc(feedPurchases.date), desc(feedPurchases.createdAt));
  return rows.map(({ p, type, setId, setNumber, by }) => ({
    id: p.id, date: p.date, feedTypeId: p.feedTypeId, feed: feedName(type), bags: p.bags, kgPerBag: p.kgPerBag, pricePerBag: p.pricePerBag, total: p.total,
    transportCost: p.transportCost, supplier: p.supplier, set: setId && setNumber !== null ? { id: setId, number: setNumber } : null, by,
  }));
}
