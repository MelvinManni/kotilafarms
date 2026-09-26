// The weekly review: for each Set running that week, its facts and the written note
import "server-only";
import { and, eq, gte, isNull, lte, or, sum } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs, expenseCategories, expenses, feedTypes, sales, sets } from "@/db/schema";
import { feedStockFor } from "@/server/services/feed/stock";
import { listSetVaccines } from "@/server/services/health/vaccines";
import { listWeights } from "@/server/services/weights";
import type { WeeklyPayload } from "@/types/weekly";
import { weekOf } from "@/utils/dates/week-of";
import { toKg } from "@/utils/metrics/feed-stock";
import { latestPerDay } from "@/utils/metrics/growth-summary";
import { setReview } from "@/utils/metrics/weekly/set-review";
import { weekFacts } from "@/utils/metrics/weekly/week-facts";

export async function weeklyFor(db: Executor, day: string, today: string): Promise<WeeklyPayload> {
  const week = weekOf(day);
  const asOf = week.end < today ? week.end : today;
  const current = week.end >= today;
  const running = await db.select().from(sets).where(and(isNull(sets.deletedAt), lte(sets.startDate, week.end), or(isNull(sets.closedOn), gte(sets.closedOn, week.start))));
  // Stock is only known for now, so run-out points belong to the current week
  const stock = current ? (await feedStockFor(db, today)).rows : [];
  const out = await Promise.all(
    running.sort((a, b) => b.number - a.number).map(async (s) => {
      const [logs, weights, vaccines, [sold], [feed]] = await Promise.all([
        db.select({ date: dailyLogs.date, deaths: dailyLogs.deaths, tags: dailyLogs.tags, deathCause: dailyLogs.deathCause, qty: dailyLogs.feedQty, unit: dailyLogs.feedUnit, kgPerBag: feedTypes.kgPerBag }).from(dailyLogs).leftJoin(feedTypes, eq(feedTypes.id, dailyLogs.feedTypeId)).where(and(eq(dailyLogs.setId, s.id), isNull(dailyLogs.deletedAt), lte(dailyLogs.date, asOf))),
        listWeights(db, s.id),
        listSetVaccines(db, s.id, asOf),
        db.select({ birds: sum(sales.birds) }).from(sales).where(and(eq(sales.setId, s.id), isNull(sales.deletedAt), lte(sales.date, asOf))),
        db.select({ total: sum(expenses.amount) }).from(expenses).innerJoin(expenseCategories, eq(expenseCategories.id, expenses.categoryId)).where(and(eq(expenses.setId, s.id), isNull(expenses.deletedAt), eq(expenseCategories.key, "feed"), lte(expenses.date, asOf))),
      ]);
      const facts = weekFacts({
        set: { number: s.number, pen: s.pen, startDate: s.startDate, intake: s.intake, sold: Number(sold?.birds ?? 0) },
        week: { start: week.start, end: asOf },
        logs: logs.map((l) => ({ date: l.date, deaths: l.deaths, tags: l.tags, deathCause: l.deathCause, feedKg: l.qty !== null && l.kgPerBag !== null ? toKg({ qty: l.qty, unit: l.unit }, l.kgPerBag) : null })),
        samples: latestPerDay(weights.samples),
        standard: weights.standard,
        feedSpend: Number(feed?.total ?? 0),
      });
      const review = setReview({ number: s.number, intake: s.intake, facts, week: { start: week.start, end: asOf }, feed: stock.filter((r) => r.eating.some((e) => e.id === s.id)), vaccines });
      return { id: s.id, number: s.number, pen: s.pen, status: s.status, intake: s.intake, facts, review };
    }),
  );
  return { week, written: asOf, sets: out };
}
