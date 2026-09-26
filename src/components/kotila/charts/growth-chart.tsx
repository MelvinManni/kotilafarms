// Weight vs breed standard by day of age: ±5% band, today marker, late zone, projection gap
import { DEFAULT_STANDARD_KG } from "@/constants/breed-standard";
import { GrowthChartCallout } from "@/components/kotila/charts/growth-chart-callout";
import { GrowthChartGrid } from "@/components/kotila/charts/growth-chart-grid";
import { GrowthChartProjection } from "@/components/kotila/charts/growth-chart-projection";
import { CHART, chartScale } from "@/components/kotila/charts/growth-chart-scale";
import { CHART_THEMES } from "@/components/kotila/charts/growth-chart-theme";
import { smoothPath, type Point } from "@/utils/charts/smooth-path";
import type { CurvePoint } from "@/utils/metrics/growth";

type KgPoint = { day: number; kg: number };

type GrowthChartProps = {
  samples: KgPoint[];
  standard?: KgPoint[];
  today?: number;
  projectTo?: number;
  lateFrom?: number | null;
  maxDay?: number;
  maxKg?: number;
  theme?: "deep" | "light";
  callout?: boolean;
  ariaLabel?: string;
};

const toCurve = (points: KgPoint[]): CurvePoint[] => points.map((p) => ({ day: p.day, weight: p.kg }));

export function GrowthChart({ samples, standard = DEFAULT_STANDARD_KG, today, projectTo, lateFrom = 28, maxDay = 42, maxKg = 3, theme = "deep", callout = true, ariaLabel }: GrowthChartProps) {
  const t = CHART_THEMES[theme];
  const scale = chartScale(maxDay, maxKg);
  const { x, y } = scale;
  const std = toCurve(standard);
  const actual = toCurve(samples);
  const band = `${smoothPath(std.map((p): Point => [x(p.day), y(p.weight * 1.05)]))} L${smoothPath(std.map((p): Point => [x(p.day), y(p.weight * 0.95)]).reverse()).slice(1)} Z`;
  const line = [{ day: 0, weight: std[0]?.weight ?? 0 }, ...actual];
  const last = actual.at(-1);
  const previous = actual.at(-2);
  const label = ariaLabel ?? `Average weight by day of age against the breed standard.${last ? ` Latest: ${last.weight.toFixed(2)} kg at day ${last.day}.` : ""}`;
  return (
    <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} role="img" aria-label={label} className="block h-auto w-full font-sans">
      <GrowthChartGrid scale={scale} theme={t} lateFrom={lateFrom} />
      <path d={band} className={t.band} />
      <path d={smoothPath(std.map((p): Point => [x(p.day), y(p.weight)]))} fill="none" strokeWidth={2.5} strokeDasharray="7 6" className={t.standard} />
      {today !== undefined ? (
        <>
          <line x1={x(today)} x2={x(today)} y1={CHART.top} y2={CHART.top + CHART.plotHeight} strokeWidth={1} strokeDasharray="3 4" className={t.today} />
          <text x={x(today) - 8} y={CHART.top + 20} fontSize={12} fontWeight={700} textAnchor="end" className={t.text}>
            Today · day {today}
          </text>
        </>
      ) : null}
      {last && previous && projectTo ? <GrowthChartProjection scale={scale} theme={t} previous={previous} last={last} standard={std} toDay={projectTo} /> : null}
      <path d={smoothPath(line.map((p): Point => [x(p.day), y(p.weight)]))} fill="none" strokeWidth={3.5} strokeLinecap="round" className={t.actualStroke} />
      {actual.map((s, i) => {
        const isLast = i === actual.length - 1;
        return (
          <circle key={s.day} cx={x(s.day)} cy={y(s.weight)} r={isLast ? 8 : 5.5} strokeWidth={3} className={isLast ? `${t.actualFill} stroke-current ${theme === "deep" ? "text-green-900" : "text-white"}` : `${t.ground} ${t.actualStroke}`}>
            <title>{`Day ${s.day}: ${s.weight.toFixed(2)} kg`}</title>
          </circle>
        );
      })}
      {last && callout ? <GrowthChartCallout scale={scale} theme={t} last={last} standard={std} /> : null}
    </svg>
  );
}
