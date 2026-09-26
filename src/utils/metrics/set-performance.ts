// Performance for a Set report: live weight produced, feed conversion and feed cost per kg
import { feedConversionRatio, feedCostPerKgLiveWeight, liveWeightKg } from "@/utils/metrics/feed";

type Input = { feedKg: number; birdsSold: number; liveBirds: number; averageGrams: number | null; feedSpend: number; closed: boolean };

export type SetPerformance = { liveKg: number | null; fcr: number | null; feedCostPerKg: number | null };

// Closed Sets count birds sold; running Sets count the birds still alive too
export function setPerformance({ feedKg, birdsSold, liveBirds, averageGrams, feedSpend, closed }: Input): SetPerformance {
  if (!averageGrams) return { liveKg: null, fcr: null, feedCostPerKg: null };
  const liveKg = liveWeightKg(closed ? birdsSold : birdsSold + liveBirds, averageGrams);
  const fcr = feedKg > 0 ? feedConversionRatio(feedKg, liveKg) : Number.NaN;
  const cost = feedSpend > 0 ? feedCostPerKgLiveWeight(feedSpend, liveKg) : Number.NaN;
  return { liveKg, fcr: Number.isFinite(fcr) ? fcr : null, feedCostPerKg: Number.isFinite(cost) ? cost : null };
}
