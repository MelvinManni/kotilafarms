// Comparing Sets: which figure is better in each row, and the three findings under the table
import type { CompareRow } from "@/types/compare";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { setNames } from "@/utils/format/set-names";
import { kg } from "@/utils/format/weight";

export type CompareMetric = { key: string; label: string; better: "low" | "high" | null; value: (r: CompareRow) => number | null; runningCounts?: boolean };

// Money and sale figures only count once a Set has closed; mortality counts so far
export const COMPARE_METRICS: CompareMetric[] = [
  { key: "intake", label: "Intake", better: null, value: (r) => r.intake },
  { key: "mortality", label: "Mortality", better: "low", value: (r) => r.deaths / r.intake, runningCounts: true },
  { key: "sold", label: "Birds sold", better: null, value: (r) => r.sold || null },
  { key: "fcr", label: "Feed conversion ratio", better: "low", value: (r) => r.fcr },
  { key: "weight", label: "Average weight at sale", better: "high", value: (r) => r.weightAtSale },
  { key: "cost", label: "Cost per bird sold", better: "low", value: (r) => r.costPerBirdSold },
  { key: "revenue", label: "Revenue per bird", better: "high", value: (r) => r.revenuePerBird },
  { key: "marginPerBird", label: "Margin per bird", better: "high", value: (r) => r.marginPerBird },
  { key: "margin", label: "Net margin", better: "high", value: (r) => r.margin },
  { key: "feedShare", label: "Feed share of cost", better: "low", value: (r) => r.feedShare },
  { key: "profit", label: "Profit", better: "high", value: (r) => r.profit },
];

// The best Set in a row, when at least two Sets have that figure and one is ahead (a tie names nobody)
export function bestIn(metric: CompareMetric, rows: CompareRow[]): CompareRow | null {
  if (!metric.better) return null;
  const cands = rows.filter((r) => (r.closed || metric.runningCounts) && metric.value(r) !== null);
  if (cands.length < 2) return null;
  const [first, second] = [...cands].sort((a, b) => (metric.better === "low" ? metric.value(a)! - metric.value(b)! : metric.value(b)! - metric.value(a)!));
  return metric.value(first!) === metric.value(second!) ? null : first!;
}

export function compareFindings(rows: CompareRow[]): { title: string; body: string }[] {
  const mort = (r: CompareRow) => r.deaths / r.intake;
  const least = Math.min(...rows.map(mort));
  const lowest = rows.filter((r) => mort(r) === least);
  const f1 = { title: lowest.length === 1 ? `Set ${lowest[0]!.number} has the lowest mortality, ${pct(least)}` : `${setNames(lowest.map((r) => r.number))} share the lowest mortality, ${pct(least)}`, body: `${rows.map((r) => `Set ${r.number} ${pct(mort(r))} (${count(r.deaths)} birds${r.closed ? "" : ", so far"})`).join(" · ")}.` };
  const closed = rows.filter((r) => r.closed && r.margin !== null);
  const best = [...closed].sort((a, b) => b.margin! - a.margin!)[0];
  const f2 = best
    ? { title: `Set ${best.number} made the best margin, ${pct(best.margin, 2)}`, body: `${closed.map((r) => `Set ${r.number} made ${naira(r.profit)} on ${count(r.intake)} day-olds`).join("; ")}.` }
    : { title: "No closed Set picked yet", body: "Profit and margin appear once a Set has sold its birds." };
  const sold = rows.filter((r) => r.closed && r.revenuePerBird !== null).sort((a, b) => a.number - b.number);
  const [a, b] = [sold[0], sold.at(-1)];
  const f3 = a && b && a !== b
    ? { title: `Revenue per bird is ${b.revenuePerBird! >= a.revenuePerBird! ? "up" : "down"} ${naira(Math.abs(b.revenuePerBird! - a.revenuePerBird!))} from Set ${a.number} to Set ${b.number}`, body: `${naira(a.revenuePerBird)} in Set ${a.number} and ${naira(b.revenuePerBird)} in Set ${b.number}${a.weightAtSale && b.weightAtSale ? `, with birds at ${kg(a.weightAtSale)} and ${kg(b.weightAtSale)} at sale` : ""}.` }
    : { title: "Pick two closed Sets to see price trends", body: "Revenue per bird and weight at sale only exist once a Set has sold." };
  return [f1, f2, f3];
}

// "Set 1, Set 2 and Set 3, metric by metric"
export function compareTitle(rows: CompareRow[]): string {
  const names = rows.map((r) => `Set ${r.number}`);
  return `${names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]}, metric by metric`;
}
