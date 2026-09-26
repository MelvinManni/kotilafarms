// Today's payload: running Sets, missed days, tasks, and (for money roles) what is owed
import "server-only";
import { and, gte, inArray, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs, setVaccines, weightSamples } from "@/db/schema";
import { can } from "@/lib/auth/roles";
import { missingLogDays } from "@/server/services/daily-logs/missing";
import { outstanding } from "@/server/services/sales/list";
import { listSets } from "@/server/services/sets/list";
import type { Role } from "@/types/role";
import type { TodayPayload } from "@/types/today";
import { addDays } from "@/utils/dates/add-days";
import { todayTasks } from "@/utils/metrics/today-tasks";

export async function todayFor(db: Executor, role: Role, today: string): Promise<TodayPayload> {
  const sets = (await listSets(db, role, today)).filter((s) => s.status !== "closed");
  const ids = sets.map((s) => s.id);
  const [logs, vaccines, samples, missing] = await Promise.all([
    ids.length ? db.select({ setId: dailyLogs.setId, date: dailyLogs.date, tags: dailyLogs.tags }).from(dailyLogs).where(and(inArray(dailyLogs.setId, ids), isNull(dailyLogs.deletedAt), gte(dailyLogs.date, addDays(today, -6)))) : [],
    ids.length ? db.select().from(setVaccines).where(and(inArray(setVaccines.setId, ids), isNull(setVaccines.deletedAt))) : [],
    ids.length ? db.select({ setId: weightSamples.setId, ageDays: weightSamples.ageDays }).from(weightSamples).where(and(inArray(weightSamples.setId, ids), isNull(weightSamples.deletedAt))) : [],
    Promise.all(sets.map(async (s) => (await missingLogDays(db, s.id, today)).map((date) => ({ setId: s.id, setNumber: s.number, date })))),
  ]);
  const loggedToday = logs.filter((l) => l.date === today).map((l) => l.setId);
  const payload: TodayPayload = {
    date: today,
    sets,
    missed: missing.flat().sort((a, b) => b.date.localeCompare(a.date)),
    loggedToday,
    tasks: todayTasks({ today, sets, loggedToday, vaccines, weekLogs: logs, samples }),
  };
  return can.seeMoney(role) ? { ...payload, owed: await outstanding(db, today) } : payload;
}
