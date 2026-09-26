"use client";
// Deep growth panel for one Set: the finding, the chart against the standard, and the key figures
import { GrowthChart } from "@/components/kotila/charts/growth-chart";
import { GrowthLegend } from "@/components/kotila/charts/growth-legend";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { GrowthFigures } from "@/components/weights/growth-figures";
import { LATE_FROM_DAY, MARKET_DAY } from "@/constants/farm";
import { useSetWeights } from "@/hooks/queries/use-weights";
import { kg } from "@/utils/format/weight";
import { pct } from "@/utils/format/percent";
import { growthHeadline } from "@/utils/metrics/growth-headline";
import { growthSummary, latestPerDay } from "@/utils/metrics/growth-summary";

type GrowthPanelProps = { setId: string; setNumber: number; dayOfAge: number; running: boolean; named?: boolean };

export function GrowthPanel({ setId, setNumber, dayOfAge, running, named }: GrowthPanelProps) {
  const weights = useSetWeights(setId);
  if (weights.isError) return <Notice tone="alert">{weights.error.message}</Notice>;
  if (!weights.data) return <Panel variant="deep" title="Growth" subtitle="Loading the weights…" />;

  const { samples, standard } = weights.data;
  const g = growthSummary(samples, standard);
  const weigh = running ? <Button variant="primary" icon="scale" href={`/weigh/${setId}`}>Weigh Set {setNumber}</Button> : null;
  if (!g)
    return (
      <Panel variant="deep" title={`No weights for Set ${setNumber} yet`} subtitle="Weigh at least 10 birds each week. The chart then shows how the Set is growing against the breed standard.">
        {weigh ? <div>{weigh}</div> : null}
      </Panel>
    );

  const h = growthHeadline(g, named ? setNumber : undefined);
  const points = latestPerDay(samples).map((s) => ({ day: s.ageDays, kg: s.averageGrams / 1000 }));
  const projection = g.projected ? ` Projected about ${kg(g.projected.grams)} at day ${MARKET_DAY} against ${kg(g.projected.standardGrams)}.` : "";
  return (
    <Panel variant="deep" headline title={h.title} subtitle={h.subtitle} action={running ? { label: `Weigh Set ${setNumber}`, href: `/weigh/${setId}` } : undefined}>
      <div className="@container">
        <div className="grid items-start gap-7 @3xl:grid-cols-[minmax(0,1fr)_200px]">
        <div className="flex min-w-0 flex-col gap-2.5">
          <GrowthLegend />
          <GrowthChart
            samples={points}
            standard={standard.map((p) => ({ day: p.day, kg: p.grams / 1000 }))}
            today={running ? dayOfAge : undefined}
            projectTo={running ? MARKET_DAY : undefined}
            lateFrom={LATE_FROM_DAY}
            maxKg={Math.max(3, ...points.map((p) => Math.ceil(p.kg)))}
            ariaLabel={`Set ${setNumber} average weight by day of age against the breed standard. Day ${g.day}: ${kg(g.averageGrams)} against ${kg(g.standardGrams)} standard, ${pct(g.gap, 1, { signed: true })}.${projection}`}
          />
        </div>
        <GrowthFigures g={g} />
        </div>
      </div>
    </Panel>
  );
}
