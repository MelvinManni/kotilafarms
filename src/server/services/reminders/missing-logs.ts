// Running Sets with no daily log for a farm day
import "server-only";
import { and, asc, eq, isNull, lte, ne, notExists } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs, sets } from "@/db/schema";
import type { MissingSet } from "@/server/mail/daily-reminder";
import { dayOfAge } from "@/utils/metrics/mortality-trend";

export async function setsMissingLog(db: Executor, day: string): Promise<MissingSet[]> {
  const logged = db
    .select({ id: dailyLogs.id })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.setId, sets.id), eq(dailyLogs.date, day), isNull(dailyLogs.deletedAt)));
  const rows = await db
    .select({ id: sets.id, number: sets.number, name: sets.name, startDate: sets.startDate })
    .from(sets)
    .where(and(ne(sets.status, "closed"), isNull(sets.deletedAt), lte(sets.startDate, day), notExists(logged)))
    .orderBy(asc(sets.number));
  return rows.map((s) => ({ id: s.id, number: s.number, name: s.name, dayOfAge: dayOfAge(s.startDate, day) }));
}
