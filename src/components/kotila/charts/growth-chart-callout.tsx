// Label box next to the latest sample: weight, day and gap to standard
import { CHART, type ChartScale } from "@/components/kotila/charts/growth-chart-scale";
import type { ChartTheme } from "@/components/kotila/charts/growth-chart-theme";
import { MINUS } from "@/utils/format/count";
import { gapToStandard, interpolateStandard, type CurvePoint } from "@/utils/metrics/growth";

export function GrowthChartCallout({ scale, theme, last, standard }: { scale: ChartScale; theme: ChartTheme; last: CurvePoint; standard: CurvePoint[] }) {
  const standardKg = interpolateStandard(standard, last.day);
  const gap = gapToStandard(last.weight, standardKg) * 100;
  let boxX = scale.x(last.day) + 13;
  if (boxX + 180 > CHART.width) boxX = scale.x(last.day) - 193;
  const boxY = scale.y(last.weight) + 11;
  return (
    <g>
      <rect x={boxX} y={boxY} width={180} height={56} rx={12} className={theme.calloutBox} />
      <text x={boxX + 14} y={boxY + 23} fontSize={14} fontWeight={800} className={theme.calloutTitle}>
        {last.weight.toFixed(2)} kg · day {last.day}
      </text>
      <text x={boxX + 14} y={boxY + 43} fontSize={12} className={theme.calloutSub}>
        Standard {standardKg.toFixed(2)} kg · {gap < 0 ? MINUS : "+"}
        {Math.abs(gap).toFixed(1)}%
      </text>
    </g>
  );
}
