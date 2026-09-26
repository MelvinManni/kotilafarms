// Where a Set stands on growth: latest sample, gap and its trend, daily gain, and the projection to market day
import { LATE_FROM_DAY, MARKET_DAY } from "@/constants/farm";
import { averageDailyGain, gapToStandard, interpolateStandard, projectWeight, type CurvePoint } from "@/utils/metrics/growth";

type Sample = { ageDays: number; averageGrams: number; count: number; uniformity: number };
type StandardPoint = { day: number; grams: number };

export type GrowthSummary = {
  day: number;
  averageGrams: number;
  count: number;
  uniformity: number;
  standardGrams: number;
  gap: number;
  previous: { day: number; gap: number } | null;
  // Gap moving by more than 1 point since about a week back
  trend: "widening" | "closing" | "steady" | null;
  dailyGainGrams: number | null;
  // Daily gain the standard itself makes from here to market day
  standardGainGrams: number | null;
  projected: { day: number; grams: number; standardGrams: number; gap: number } | null;
  late: boolean;
};

// One point per day of age (a repeat sample on the same day replaces the earlier one)
export function latestPerDay<T extends { ageDays: number }>(samples: T[]): T[] {
  const byDay = new Map<number, T>();
  for (const s of samples) byDay.set(s.ageDays, s);
  return [...byDay.values()].sort((a, b) => a.ageDays - b.ageDays);
}

export function growthSummary(samples: Sample[], standard: StandardPoint[]): GrowthSummary | null {
  const points = latestPerDay(samples);
  const last = points.at(-1);
  if (!last || standard.length === 0) return null;
  const curve: CurvePoint[] = standard.map((p) => ({ day: p.day, weight: p.grams }));
  const std = (day: number) => interpolateStandard(curve, day);
  const gapAt = (s: Sample) => gapToStandard(s.averageGrams, std(s.ageDays));
  const prev = points.at(-2);
  const gap = gapAt(last);
  // Trend is judged against the sample about a week back
  const weekBack = points.findLast((s) => s.ageDays <= last.ageDays - 7);
  const previous = weekBack ? { day: weekBack.ageDays, gap: gapAt(weekBack) } : null;
  const move = previous ? Math.abs(gap) - Math.abs(previous.gap) : 0;
  const here = { day: last.ageDays, weight: last.averageGrams };
  const before = prev ? { day: prev.ageDays, weight: prev.averageGrams } : null;
  const projectedGrams = before && last.ageDays < MARKET_DAY ? projectWeight(before, here, MARKET_DAY) : null;
  return {
    day: last.ageDays,
    averageGrams: last.averageGrams,
    count: last.count,
    uniformity: last.uniformity,
    standardGrams: Math.round(std(last.ageDays)),
    gap,
    previous,
    trend: previous ? (move > 0.01 ? "widening" : move < -0.01 ? "closing" : "steady") : null,
    dailyGainGrams: before ? Math.round(averageDailyGain(before, here)) : null,
    standardGainGrams: last.ageDays < MARKET_DAY ? Math.round((std(MARKET_DAY) - std(last.ageDays)) / (MARKET_DAY - last.ageDays)) : null,
    projected: projectedGrams === null ? null : { day: MARKET_DAY, grams: Math.round(projectedGrams), standardGrams: Math.round(std(MARKET_DAY)), gap: gapToStandard(projectedGrams, std(MARKET_DAY)) },
    late: last.ageDays >= LATE_FROM_DAY,
  };
}
