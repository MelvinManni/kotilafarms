// Feed types: the list for the daily log and purchases, and adding or changing one in Settings
import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { feedTypes } from "@/db/schema";
import { recordChange, recordCreate } from "@/server/audit";
import { notFound } from "@/server/errors";
import type { FeedTypeCreate, FeedTypeUpdate } from "@/schemas/feed";
import type { SessionUser } from "@/types/session";

export async function listFeedTypes(db: Executor, includeInactive = false) {
  const where = includeInactive ? isNull(feedTypes.deletedAt) : and(isNull(feedTypes.deletedAt), eq(feedTypes.active, true));
  return db.select({ id: feedTypes.id, kind: feedTypes.kind, brand: feedTypes.brand, kgPerBag: feedTypes.kgPerBag, active: feedTypes.active }).from(feedTypes).where(where).orderBy(asc(feedTypes.kind));
}

export async function addFeedType(db: Executor, input: FeedTypeCreate, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(feedTypes).values({ ...input, clientId: randomUUID(), createdBy: actor.id }).returning();
    await recordCreate(tx, "feed_types", row!.id, { userId: actor.id });
    return row!;
  });
}

// Change the brand or bag size, or take a feed off the lists (it stays on old logs and purchases)
export async function updateFeedType(db: Executor, id: string, input: FeedTypeUpdate, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(feedTypes).where(and(eq(feedTypes.id, id), isNull(feedTypes.deletedAt)));
    if (!before) throw notFound("That feed");
    const [after] = await tx.update(feedTypes).set(input).where(eq(feedTypes.id, id)).returning();
    await recordChange(tx, { table: "feed_types", rowId: id, before, after: input, userId: actor.id });
    return after!;
  });
}
