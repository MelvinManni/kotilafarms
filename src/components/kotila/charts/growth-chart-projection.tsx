// Dotted projection from the latest gain to a target day, with the gap it is heading for
import { CHART, type ChartScale } from "@/components/kotila/charts/growth-chart-scale";
import type { ChartTheme } from "@/components/kotila/charts/growth-chart-theme";
import { gapToStandard, interpolateStandard, projectWeight, type CurvePoint } from "@/utils/metrics/growth";

type ProjectionProps = { scale: ChartScale; theme: ChartTheme; previous: CurvePoint; last: CurvePoint; standard: CurvePoint[]; toDay: number };

export function GrowthChartProjection({ scale, theme, previous, last, standard, toDay }: ProjectionProps) {
  const { x, y } = scale;
  const projected = projectWeight(previous, last, toDay);
  const standardKg = interpolateStandard(standard, toDay);
  const gap = Math.round(gapToStandard(projected, standardKg) * 100);
  // Flip the label left when it would run past the right edge (~230px wide)
  let textX = x(toDay) + 13;
  let anchor: "start" | "end" = "start";
  if (textX > CHART.width - 230) {
    textX = x(toDay) - 13;
    anchor = "end";
  }
  const midY = (y(standardKg) + y(projected)) / 2;
  return (
    <g>
      <line x1={x(last.day)} y1={y(last.weight)} x2={x(toDay)} y2={y(projected)} strokeWidth={3} strokeDasharray="1 8" strokeLinecap="round" className={theme.actualStroke} />
      <line x1={x(toDay)} x2={x(toDay)} y1={y(standardKg) + 4} y2={y(projected) - 5} strokeWidth={2} className={theme.gapStroke} />
      <circle cx={x(toDay)} cy={y(standardKg)} r={5} className="fill-yellow-500" />
      <circle cx={x(toDay)} cy={y(projected)} r={6} strokeWidth={2.5} strokeDasharray="3 3" className={`${theme.ground} ${theme.actualStroke}`} />
      <text x={textX} y={midY - 2} fontSize={13} fontWeight={700} textAnchor={anchor} className={theme.gapText}>
        At this rate: {projected.toFixed(2)} kg by day {toDay}
      </text>
      <text x={textX} y={midY + 16} fontSize={12} textAnchor={anchor} className={theme.gapSub}>
        {Math.abs(gap)}% {gap < 0 ? "under" : "over"} the {standardKg.toFixed(2)} kg standard
      </text>
    </g>
  );
}
