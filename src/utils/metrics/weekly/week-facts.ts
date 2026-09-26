// The numbers behind one Set's weekly review, worked out from its records up to the week's end
import { addDays } from "@/utils/dates/add-days";
import { daysBetween } from "@/utils/dates/days-between";
import { averageDailyGain, gapToStandard, interpolateStandard, projectWeight } from "@/utils/metrics/growth";
import { feedConversionRatio, feedCostPerKgLiveWeight, liveWeightKg } from "@/utils/metrics/feed";

export type WeekInput = {
  set: { number: number; pen: string | null; startDate: string; intake: number; sold: number };
  week: { start: string; end: string };
  logs: { date: string; deaths: number; tags: string[]; deathCause: string | null; feedKg: number | null }[];
  samples: { ageDays: number; averageGrams: number }[];
  standard: { day: number; grams: number }[];
  feedSpend: number;
};

export type WeekFacts = {
  day: number;
  live: number;
  // perWeek: average before this week, leaving out the first 7 days (brooding losses); null with under a week of that
  deaths: { week: number; lastWeek: number; perWeek: number | null; total: number; noCause: number };
  tags: { tag: string; days: number }[];
  missedDays: string[];
  weight: { day: number; grams: number; standard: number; gap: number; before: { day: number; gap: number } | null; gain: number | null; standardGain: number | null; projected: number | null; projectedStandard: number } | null;
  fcr: { now: number; projected: number | null } | null;
  feedCostPerKg: number | null;
};

const MARKET_DAY = 35;

export function weekFacts({ set, week, logs, samples, standard, feedSpend }: WeekInput): WeekFacts {
  const upTo = logs.filter((l) => l.date <= week.end);
  const inWeek = upTo.filter((l) => l.date >= week.start);
  const lastWeek = upTo.filter((l) => l.date >= addDays(week.start, -7) && l.date < week.start);
  const total = upTo.reduce((a, l) => a + l.deaths, 0);
  const day = daysBetween(set.startDate, week.end);
  const settled = upTo.filter((l) => l.date > addDays(set.startDate, 7) && l.date < week.start);
  const settledDays = daysBetween(addDays(set.startDate, 7), week.start) - 1;
  const perWeek = settledDays >= 7 ? Math.round((settled.reduce((a, l) => a + l.deaths, 0) / settledDays) * 70) / 10 : null;
  const tagDays = new Map<string, number>();
  for (const l of inWeek) for (const t of l.tags) tagDays.set(t, (tagDays.get(t) ?? 0) + 1);
  const logged = new Set(upTo.map((l) => l.date));
  const missedDays = Array.from({ length: 7 }, (_, i) => addDays(week.start, i)).filter((d) => d > set.startDate && d <= week.end && !logged.has(d));
  const live = set.intake - total - set.sold;

  const curve = standard.map((p) => ({ day: p.day, weight: p.grams }));
  const done = samples.filter((s) => s.ageDays <= day).sort((a, b) => a.ageDays - b.ageDays);
  const last = done.at(-1);
  const prev = done.at(-2);
  const weight = last
    ? (() => {
        const std = interpolateStandard(curve, last.ageDays);
        const here = { day: last.ageDays, weight: last.averageGrams };
        const there = prev ? { day: prev.ageDays, weight: prev.averageGrams } : null;
        const gain = there ? averageDailyGain(there, here) : Number.NaN;
        return {
          day: last.ageDays, grams: last.averageGrams, standard: Math.round(std), gap: gapToStandard(last.averageGrams, std),
          before: prev ? { day: prev.ageDays, gap: gapToStandard(prev.averageGrams, interpolateStandard(curve, prev.ageDays)) } : null,
          gain: Number.isNaN(gain) ? null : Math.round(gain),
          standardGain: last.ageDays < MARKET_DAY ? Math.round((interpolateStandard(curve, MARKET_DAY) - std) / (MARKET_DAY - last.ageDays)) : null,
          projected: there && last.ageDays < MARKET_DAY ? Math.round(projectWeight(there, here, MARKET_DAY)) : null,
          projectedStandard: Math.round(interpolateStandard(curve, MARKET_DAY)),
        };
      })()
    : null;

  const feedKg = upTo.reduce((a, l) => a + (l.feedKg ?? 0), 0);
  const liveKg = last ? liveWeightKg(live + set.sold, last.averageGrams) : 0;
  const recentFeedPerDay = inWeek.reduce((a, l) => a + (l.feedKg ?? 0), 0) / Math.max(1, inWeek.filter((l) => l.feedKg).length);
  const fcrNow = feedKg > 0 && liveKg > 0 ? feedConversionRatio(feedKg, liveKg) : null;
  const projectedFcr = fcrNow !== null && weight?.projected ? feedConversionRatio(feedKg + recentFeedPerDay * (MARKET_DAY - day), liveWeightKg(live + set.sold, weight.projected)) : null;
  return {
    day,
    live,
    deaths: { week: inWeek.reduce((a, l) => a + l.deaths, 0), lastWeek: lastWeek.reduce((a, l) => a + l.deaths, 0), perWeek, total, noCause: inWeek.filter((l) => l.deaths > 0 && !l.deathCause).reduce((a, l) => a + l.deaths, 0) },
    tags: [...tagDays].map(([tag, days]) => ({ tag, days })).sort((a, b) => b.days - a.days),
    missedDays,
    weight,
    fcr: fcrNow === null ? null : { now: fcrNow, projected: projectedFcr },
    feedCostPerKg: liveKg > 0 && feedSpend > 0 ? feedCostPerKgLiveWeight(feedSpend, liveKg) : null,
  };
}
