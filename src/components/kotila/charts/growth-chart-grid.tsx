// Growth chart background: late zone, kg grid lines, axis labels
import { CHART, type ChartScale } from "@/components/kotila/charts/growth-chart-scale";
import type { ChartTheme } from "@/components/kotila/charts/growth-chart-theme";

export function GrowthChartGrid({ scale, theme, lateFrom }: { scale: ChartScale; theme: ChartTheme; lateFrom: number | null }) {
  const { x, y, maxDay, maxKg } = scale;
  const halfKgs = Array.from({ length: Math.floor(maxKg * 2) + 1 }, (_, i) => i / 2);
  const wholeKgs = Array.from({ length: Math.floor(maxKg) + 1 }, (_, i) => i);
  const weeks = Array.from({ length: Math.floor(maxDay / 7) + 1 }, (_, i) => i * 7);
  return (
    <g>
      {lateFrom !== null ? (
        <>
          <rect x={x(lateFrom)} y={CHART.top} width={x(maxDay) - x(lateFrom)} height={CHART.plotHeight} className={theme.zone} />
          <text x={x(lateFrom) + 10} y={CHART.top + 20} fontSize={12} className={theme.label}>
            Hard to recover after day {lateFrom}
          </text>
        </>
      ) : null}
      {halfKgs.map((k) => (
        <line key={`g${k}`} x1={CHART.left} x2={CHART.left + CHART.plotWidth} y1={y(k)} y2={y(k)} strokeWidth={1} className={k === 0 ? theme.axis : theme.grid} />
      ))}
      {wholeKgs.map((k) => (
        <text key={`y${k}`} x={CHART.left - 8} y={y(k) + 4} fontSize={12} textAnchor="end" className={theme.label}>
          {k === 0 ? "0" : k === maxKg ? `${k.toFixed(1)} kg` : k.toFixed(1)}
        </text>
      ))}
      {weeks.map((d) => (
        <text key={`x${d}`} x={x(d)} y={CHART.height - 8} fontSize={12} textAnchor="middle" className={theme.label}>
          {d === 0 ? "Day 0" : d}
        </text>
      ))}
    </g>
  );
}
