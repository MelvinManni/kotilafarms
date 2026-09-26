// Days with no log, from the day after arrival to yesterday (or the closing day)
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs, sets } from "@/db/schema";
import { notFound } from "@/server/errors";
import { missingDays } from "@/utils/metrics/missing-days";

export async function missingLogDays(db: Executor, setId: string, today: string): Promise<string[]> {
  const [set] = await db.select().from(sets).where(and(eq(sets.id, setId), isNull(sets.deletedAt)));
  if (!set) throw notFound("That Set");
  const logged = await db.select({ date: dailyLogs.date }).from(dailyLogs).where(and(eq(dailyLogs.setId, setId), isNull(dailyLogs.deletedAt)));
  return missingDays(set.startDate, set.closedOn, today, logged.map((l) => l.date));
}
