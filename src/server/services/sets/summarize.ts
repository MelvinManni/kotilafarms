// Turn a Set row and its totals into what the API returns (all numbers from utils/metrics)
import "server-only";
import type { sets } from "@/db/schema";
import { can } from "@/lib/auth/roles";
import type { SetTotals } from "@/server/services/sets/aggregates";
import type { Role } from "@/types/role";
import type { SetSummary } from "@/types/sets";
import { liveBirds, mortalityRate } from "@/utils/metrics/birds";
import { dayOfAge, mortalityTrend, type DayDeaths } from "@/utils/metrics/mortality-trend";
import { setPnl } from "@/utils/metrics/set-pnl";

type SetRow = typeof sets.$inferSelect;

export function summarizeSet(set: SetRow, totals: SetTotals, logs: DayDeaths[], today: string, role: Role): SetSummary {
  const end = set.closedOn && set.closedOn < today ? set.closedOn : today;
  const trend = mortalityTrend(logs, set.startDate, end);
  const summary: SetSummary = {
    id: set.id,
    number: set.number,
    name: set.name,
    pen: set.pen,
    status: set.status,
    startDate: set.startDate,
    closedOn: set.closedOn,
    intake: set.intake,
    dayOfAge: dayOfAge(set.startDate, today, set.closedOn),
    deaths: totals.deaths,
    mortalityRate: mortalityRate(totals.deaths, set.intake),
    birdsSold: totals.sold,
    liveBirds: liveBirds(set.intake, totals.deaths, totals.sold),
    trend: { thisWeek: trend.thisWeek, lastWeek: trend.lastWeek, perWeekAverage: trend.perWeekAverage },
  };
  if (!can.seeMoney(role)) return summary;
  const pnl = setPnl({ intake: set.intake, birdsSold: totals.sold, birdRevenue: totals.birdRevenue, manureRevenue: totals.manure, expensesByCategory: { all: totals.spend } });
  return { ...summary, money: { spend: pnl.expenses, revenue: pnl.revenue, profit: pnl.profit, margin: Number.isNaN(pnl.margin) ? null : pnl.margin } };
}
