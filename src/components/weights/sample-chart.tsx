// Earlier samples plus the one being typed, against the farm's breed standard
import { GrowthChart } from "@/components/kotila/charts/growth-chart";
import { Panel } from "@/components/kotila/panel";
import { LATE_FROM_DAY, MARKET_DAY } from "@/constants/farm";
import { kg } from "@/utils/format/weight";
import { interpolateStandard, projectWeight } from "@/utils/metrics/growth";

type Point = { day: number; grams: number };

type SampleChartProps = { setNumber: number; standard: Point[]; samples: Point[]; ageDays: number };

const toKg = (p: Point) => ({ day: p.day, kg: p.grams / 1000 });
const asCurve = (p: Point) => ({ day: p.day, weight: p.grams });

export function SampleChart({ setNumber, standard, samples, ageDays }: SampleChartProps) {
  const [previous, last] = samples.slice(-2);
  const projected = previous && last && last.day < MARKET_DAY ? projectWeight(asCurve(previous), asCurve(last), MARKET_DAY) : null;
  const subtitle = projected ? `Projected ${kg(projected)} at day ${MARKET_DAY} against ${kg(interpolateStandard(standard.map(asCurve), MARKET_DAY))} standard` : "Weigh again next week to see where the Set is heading";
  const maxKg = Math.max(3, ...samples.map((s) => Math.ceil(s.grams / 1000)));
  return (
    <Panel variant="raised" title="Against the breed standard" subtitle={subtitle}>
      <GrowthChart
        theme="light"
        samples={samples.map(toKg)}
        standard={standard.map(toKg)}
        today={ageDays}
        projectTo={MARKET_DAY}
        lateFrom={LATE_FROM_DAY}
        maxKg={maxKg}
        ariaLabel={last ? `Set ${setNumber} averages ${kg(last.grams)} at day ${last.day}` : `Breed standard for Set ${setNumber}`}
      />
    </Panel>
  );
}
