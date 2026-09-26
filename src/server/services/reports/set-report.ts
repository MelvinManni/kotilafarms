// Everything the Set report shows, for one Set or several added together
import "server-only";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs, expenseCategories, expenses, feedTypes, sales } from "@/db/schema";
import { pnlFor } from "@/server/services/finance/pnl";
import { saleRows } from "@/server/services/sales/rows";
import { setTotals } from "@/server/services/sets/aggregates";
import { listWeights } from "@/server/services/weights";
import type { SetReportPayload } from "@/types/report";
import { liveBirds } from "@/utils/metrics/birds";
import { toKg } from "@/utils/metrics/feed-stock";
import { latestPerDay } from "@/utils/metrics/growth-summary";
import { setPerformance } from "@/utils/metrics/set-performance";

const LARGEST = 7;

export async function setReportFor(db: Executor, setIds: string[], today: string): Promise<SetReportPayload> {
  const money = await pnlFor(db, setIds);
  const [totals, logs, spent, unpaid, weights] = await Promise.all([
    setTotals(db, setIds),
    db.select({ qty: dailyLogs.feedQty, unit: dailyLogs.feedUnit, kgPerBag: feedTypes.kgPerBag }).from(dailyLogs).innerJoin(feedTypes, eq(feedTypes.id, dailyLogs.feedTypeId)).where(and(inArray(dailyLogs.setId, setIds), isNull(dailyLogs.deletedAt), isNotNull(dailyLogs.feedQty))),
    db.select({ date: expenses.date, description: expenses.description, category: expenseCategories.name, amount: expenses.amount }).from(expenses).innerJoin(expenseCategories, eq(expenseCategories.id, expenses.categoryId)).where(and(inArray(expenses.setId, setIds), isNull(expenses.deletedAt))).orderBy(desc(expenses.amount)),
    saleRows(db, [inArray(sales.setId, setIds)], today),
    Promise.all(setIds.map((id) => listWeights(db, id))),
  ]);
  const deaths = setIds.reduce((a, id) => a + totals.get(id)!.deaths, 0);
  const live = liveBirds(money.intake, deaths, money.birdsSold);
  const closed = money.sets.every((s) => s.status === "closed");
  // Weight at sale: the average of each Set's latest sample
  const latest = weights.map((w) => latestPerDay(w.samples).at(-1)).filter((s) => s !== undefined);
  const saleWeight = latest.length ? { averageGrams: Math.round(latest.reduce((a, s) => a + s.averageGrams, 0) / latest.length), day: Math.max(...latest.map((s) => s.ageDays)) } : null;
  const feedKg = logs.reduce((a, l) => a + toKg({ qty: l.qty!, unit: l.unit }, l.kgPerBag), 0);
  const feedSpend = money.byCategory.find((c) => c.label === "Feed")?.value ?? 0;
  const one = setIds.length === 1 ? weights[0]! : null;
  return {
    ...money,
    prepared: today,
    period: { from: money.sets.map((s) => s.startDate).sort()[0]!, to: closed ? money.sets.map((s) => s.closedOn!).sort().at(-1)! : null },
    deaths,
    liveBirds: live,
    saleWeight,
    performance: { feedKg: Math.round(feedKg), feedSpend, ...setPerformance({ feedKg, birdsSold: money.birdsSold, liveBirds: live, averageGrams: saleWeight?.averageGrams ?? null, feedSpend, closed }) },
    growth: one ? { samples: latestPerDay(one.samples).map((s) => ({ day: s.ageDays, grams: s.averageGrams })), standard: one.standard } : null,
    largestExpenses: { rows: spent.slice(0, LARGEST).sort((a, b) => a.date.localeCompare(b.date)), of: spent.length },
    unpaid: { count: unpaid.filter((r) => r.balance > 0).length, total: unpaid.reduce((a, r) => a + Math.max(0, r.balance), 0) },
  };
}
