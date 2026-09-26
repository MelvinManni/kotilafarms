// Per-Set totals (deaths, birds sold, bird and manure revenue, spend), one grouped query each
import "server-only";
import { and, count, inArray, isNull, sum } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs, expenses, otherSales, sales, weightSamples } from "@/db/schema";
import { queries } from "@/server/queries";

export type SetTotals = { deaths: number; sold: number; birdRevenue: number; manure: number; spend: number; logs: number; weights: number; salesCount: number; expenseCount: number };

const empty = (): SetTotals => ({ deaths: 0, sold: 0, birdRevenue: 0, manure: 0, spend: 0, logs: 0, weights: 0, salesCount: 0, expenseCount: 0 });

export async function setTotals(db: Executor, setIds: string[]): Promise<Map<string, SetTotals>> {
  const out = new Map(setIds.map((id) => [id, empty()]));
  if (!setIds.length) return out;
  const n = (v: unknown) => Number(v ?? 0);
  const [logs, sold, manure, spend, weights] = await queries(db, [
    () => db.select({ setId: dailyLogs.setId, deaths: sum(dailyLogs.deaths), n: count() }).from(dailyLogs).where(and(inArray(dailyLogs.setId, setIds), isNull(dailyLogs.deletedAt))).groupBy(dailyLogs.setId),
    () => db.select({ setId: sales.setId, birds: sum(sales.birds), total: sum(sales.total), n: count() }).from(sales).where(and(inArray(sales.setId, setIds), isNull(sales.deletedAt))).groupBy(sales.setId),
    () => db.select({ setId: otherSales.setId, total: sum(otherSales.amount) }).from(otherSales).where(and(inArray(otherSales.setId, setIds), isNull(otherSales.deletedAt))).groupBy(otherSales.setId),
    () => db.select({ setId: expenses.setId, total: sum(expenses.amount), n: count() }).from(expenses).where(and(inArray(expenses.setId, setIds), isNull(expenses.deletedAt))).groupBy(expenses.setId),
    () => db.select({ setId: weightSamples.setId, n: count() }).from(weightSamples).where(and(inArray(weightSamples.setId, setIds), isNull(weightSamples.deletedAt))).groupBy(weightSamples.setId),
  ]);
  for (const r of logs) Object.assign(out.get(r.setId)!, { deaths: n(r.deaths), logs: n(r.n) });
  for (const r of sold) Object.assign(out.get(r.setId)!, { sold: n(r.birds), birdRevenue: n(r.total), salesCount: n(r.n) });
  for (const r of manure) out.get(r.setId)!.manure = n(r.total);
  for (const r of spend) if (r.setId) Object.assign(out.get(r.setId)!, { spend: n(r.total), expenseCount: n(r.n) });
  for (const r of weights) out.get(r.setId)!.weights = n(r.n);
  return out;
}

// Deaths per logged day for the given Sets (for the weekly trend and the deaths chart)
export async function deathsByDay(db: Executor, setIds: string[]) {
  if (!setIds.length) return [];
  return db
    .select({ setId: dailyLogs.setId, date: dailyLogs.date, deaths: dailyLogs.deaths })
    .from(dailyLogs)
    .where(and(inArray(dailyLogs.setId, setIds), isNull(dailyLogs.deletedAt)))
    .orderBy(dailyLogs.date);
}
