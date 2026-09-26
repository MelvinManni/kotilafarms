// Headline figures across all Sets (money only for owners and managers)
import { Figure } from "@/components/kotila/figure";
import { setsOverview } from "@/utils/metrics/sets-overview";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import type { SetSummary } from "@/types/sets";

const setList = (numbers: number[]) => (numbers.length === 0 ? "No Sets running" : numbers.length === 1 ? `Set ${numbers[0]}` : `Sets ${numbers.join(" and ")}`);

export function SetsFigures({ sets }: { sets: SetSummary[] }) {
  const o = setsOverview(sets);
  return (
    <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface px-6 py-5 lg:grid-cols-4">
      <Figure label="Live birds now" value={count(o.liveBirds)} sub={setList(o.runningNumbers)} size="lg" />
      <Figure label="Birds sold, all Sets" value={count(o.birdsSold)} size="lg" />
      {o.closedProfit !== null ? <Figure label="Profit on closed Sets" value={naira(o.closedProfit)} sub="after all Set expenses" size="lg" /> : null}
      {o.best ? <Figure label="Best margin" value={pct(o.best.margin, 2)} sub={`Set ${o.best.number} · ${count(o.best.intake)} birds`} size="lg" /> : null}
    </div>
  );
}
