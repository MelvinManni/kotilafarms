// Feed types in use, for the daily log and feed purchases
import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { feedTypes } from "@/db/schema";

export async function listFeedTypes(db: Executor, includeInactive = false) {
  const where = includeInactive ? isNull(feedTypes.deletedAt) : and(isNull(feedTypes.deletedAt), eq(feedTypes.active, true));
  return db.select({ id: feedTypes.id, kind: feedTypes.kind, brand: feedTypes.brand, kgPerBag: feedTypes.kgPerBag, active: feedTypes.active }).from(feedTypes).where(where).orderBy(asc(feedTypes.kind));
}
