// Live figures for the sample being typed: average, standard and gap, uniformity, birds weighed
import { Delta } from "@/components/kotila/delta";
import { Figure } from "@/components/kotila/figure";
import { Panel } from "@/components/kotila/panel";
import { count } from "@/utils/format/count";
import { pct } from "@/utils/format/percent";
import { kg } from "@/utils/format/weight";
import type { SampleStats } from "@/utils/metrics/sample-stats";

type SampleFiguresProps = { stats: SampleStats; ageDays: number; liveBirds: number };

// Headline says what the sample shows so far
function headline({ count: n, gap }: SampleStats, ageDays: number) {
  if (n === 0) return "Add the first bird to see how the Set is doing";
  if (gap === null) return `Average so far at day ${ageDays}`;
  if (Math.abs(gap) < 0.0005) return `On the standard for day ${ageDays}`;
  return `${pct(Math.abs(gap))} ${gap < 0 ? "under" : "over"} the standard for day ${ageDays}`;
}

export function SampleFigures({ stats, ageDays, liveBirds }: SampleFiguresProps) {
  const { gap, standardGrams, averageGrams } = stats;
  const has = stats.count > 0;
  return (
    <Panel variant="raised" headline title={headline(stats, ageDays)} subtitle="Updates as you add each bird">
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <Figure label="Average" value={has ? kg(averageGrams) : "—"} size="lg" />
        <div className="flex flex-col gap-1.5">
          <Figure label={`Standard, day ${ageDays}`} value={kg(standardGrams)} />
          {has && gap !== null ? (
            <Delta direction={gap < 0 ? "down" : gap > 0 ? "up" : "flat"} goodWhen="up" tooltip={`${kg(averageGrams)} average ÷ ${kg(standardGrams)} breed standard at day ${ageDays} − 1 = ${pct(gap, 1, { signed: true })}`}>
              {pct(Math.abs(gap))} {gap < 0 ? "under" : "over"}
            </Delta>
          ) : null}
        </div>
        <Figure label="Uniformity" value={has ? pct(stats.uniformity, 0) : "—"} sub="within ±10% of the average" />
        <Figure label="Birds weighed" value={count(stats.count)} sub={`of ${count(liveBirds)} live`} />
      </div>
    </Panel>
  );
}
