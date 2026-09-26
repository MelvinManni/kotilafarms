// Today's payload: running Sets, missed days, tasks, and (for money roles) what is owed
import "server-only";
import { and, eq, gt, gte, inArray, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs, devices, setVaccines, users, weightSamples } from "@/db/schema";
import { can } from "@/lib/auth/roles";
import { canOpenPath } from "@/constants/route-access";
import { missingLogDays } from "@/server/services/daily-logs/missing";
import { outstanding } from "@/server/services/sales/list";
import { listSets } from "@/server/services/sets/list";
import type { Role } from "@/types/role";
import type { TodayPayload } from "@/types/today";
import { addDays } from "@/utils/dates/add-days";
import { todayTasks } from "@/utils/metrics/today-tasks";
import { listWeights } from "@/server/services/weights";
import { feedStockFor } from "@/server/services/feed/stock";
import { eachQuery, queries } from "@/server/queries";
import { growthSummary } from "@/utils/metrics/growth-summary";

export async function todayFor(db: Executor, role: Role, today: string): Promise<TodayPayload> {
  const sets = (await listSets(db, role, today)).filter((s) => s.status !== "closed");
  const ids = sets.map((s) => s.id);
  const [logs, vaccines, samples, missing] = await queries(db, [
    () => ids.length ? db.select({ setId: dailyLogs.setId, date: dailyLogs.date, tags: dailyLogs.tags }).from(dailyLogs).where(and(inArray(dailyLogs.setId, ids), isNull(dailyLogs.deletedAt), gte(dailyLogs.date, addDays(today, -6)))) : [],
    () => ids.length ? db.select().from(setVaccines).where(and(inArray(setVaccines.setId, ids), isNull(setVaccines.deletedAt))) : [],
    () => ids.length ? db.select({ setId: weightSamples.setId, ageDays: weightSamples.ageDays }).from(weightSamples).where(and(inArray(weightSamples.setId, ids), isNull(weightSamples.deletedAt))) : [],
    () => eachQuery(db, sets, async (s) => (await missingLogDays(db, s.id, today)).map((date) => ({ setId: s.id, setNumber: s.number, date }))),
  ]);
  const loggedToday = logs.filter((l) => l.date === today).map((l) => l.setId);
  // Logs other phones said are waiting, and that still haven't arrived
  const holding = await db.select({ person: users.name, summary: devices.pendingSummary }).from(devices).innerJoin(users, eq(users.id, devices.userId)).where(gt(devices.pendingCount, 0));
  const arrived = new Set((ids.length ? await db.select({ setId: dailyLogs.setId, date: dailyLogs.date }).from(dailyLogs).where(and(inArray(dailyLogs.setId, ids), isNull(dailyLogs.deletedAt))) : []).map((l) => `${l.setId}|${l.date}`));
  const waiting = holding.flatMap((d) =>
    (d.summary as { type: string; setId?: string | null; date?: string }[])
      .filter((i) => i.type === "dailyLog.upsert" && i.setId && i.date && !arrived.has(`${i.setId}|${i.date}`))
      .map((i) => ({ person: d.person, setId: i.setId!, date: i.date! })),
  );
  // The running Set furthest under its standard leads the growth panel
  const gaps = await eachQuery(db, sets.filter((s) => samples.some((w) => w.setId === s.id)), async (s) => {
    const w = await listWeights(db, s.id);
    return { setId: s.id, gap: growthSummary(w.samples, w.standard)?.gap ?? 0 };
  });
  const growthSetId = gaps.sort((a, b) => a.gap - b.gap)[0]?.setId ?? null;
  const feed = (await feedStockFor(db, today)).rows;
  // Everyone sees the task; the link only when this role can open the page
  const tasks = todayTasks({ today, sets, loggedToday, vaccines, weekLogs: logs, samples, waiting, feed }).map((t) => (t.href && !canOpenPath(t.href, role) ? { ...t, href: undefined } : t));
  const payload: TodayPayload = {
    date: today,
    sets,
    missed: missing.flat().sort((a, b) => b.date.localeCompare(a.date)),
    loggedToday,
    growthSetId,
    tasks,
  };
  return can.seeMoney(role) ? { ...payload, owed: await outstanding(db, today) } : payload;
}
