// Everything shown for one weight sample, from the weights and the breed standard
import { averageDailyGain, gapToStandard, interpolateStandard } from "@/utils/metrics/growth";
import { averageWeight, coefficientOfVariation, uniformity } from "@/utils/metrics/weight-sample";

export type SampleStats = { count: number; averageGrams: number; uniformity: number; cv: number; standardGrams: number | null; gap: number | null; dailyGainGrams: number | null };

export function sampleStats(weights: number[], ageDays: number, standard: { day: number; grams: number }[], previous?: { ageDays: number; averageGrams: number }): SampleStats {
  const averageGrams = averageWeight(weights);
  const standardGrams = standard.length ? Math.round(interpolateStandard(standard.map((p) => ({ day: p.day, weight: p.grams })), ageDays)) : null;
  const gain = previous ? averageDailyGain({ day: previous.ageDays, weight: previous.averageGrams }, { day: ageDays, weight: averageGrams }) : Number.NaN;
  return {
    count: weights.length,
    averageGrams: weights.length ? Math.round(averageGrams) : 0,
    uniformity: uniformity(weights),
    cv: coefficientOfVariation(weights),
    standardGrams,
    gap: standardGrams && weights.length ? gapToStandard(averageGrams, standardGrams) : null,
    dailyGainGrams: Number.isNaN(gain) ? null : Math.round(gain),
  };
}
