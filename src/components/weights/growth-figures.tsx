// Figures beside the growth chart: latest average, standard, daily gain, uniformity
import { Figure } from "@/components/kotila/figure";
import { MARKET_DAY } from "@/constants/farm";
import { count } from "@/utils/format/count";
import { pct } from "@/utils/format/percent";
import { kg } from "@/utils/format/weight";
import type { GrowthSummary } from "@/utils/metrics/growth-summary";

export function GrowthFigures({ g }: { g: GrowthSummary }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4.5 @3xl:grid-cols-1 @3xl:pt-8.5">
      <Figure tone="ondeep" label={`Average day ${g.day} · ${count(g.count)} birds`} value={kg(g.averageGrams)} sub={`${pct(g.gap, 1, { signed: true })} against standard`} />
      <Figure tone="standard" label={`Standard for day ${g.day}`} value={kg(g.standardGrams)} />
      {g.dailyGainGrams !== null ? (
        <Figure tone="ondeep" label="Daily gain since last weighing" value={`${count(g.dailyGainGrams)} g`} sub={g.standardGainGrams !== null ? `standard needs ${count(g.standardGainGrams)} g a day to day ${MARKET_DAY}` : undefined} />
      ) : null}
      <Figure tone="ondeep" label="Uniformity (±10%)" value={pct(g.uniformity, 0)} />
    </div>
  );
}
