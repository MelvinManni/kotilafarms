// Small trend line; the endpoint is the emphasis, red-orange when the latest move is bad
import { cn } from "@/utils/cn";

type SparklineProps = { values: number[]; width?: number; height?: number; tone?: "default" | "alert"; endTone?: "alert"; label?: string };

export function Sparkline({ values, width = 120, height = 56, tone = "default", endTone, label = "Trend" }: SparklineProps) {
  if (values.length < 2) return null;
  const pad = 6;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map((v, i): [number, number] => [pad + (i * (width - pad * 2)) / (values.length - 1), pad + (height - pad * 2) * (1 - (v - min) / range)]);
  const line = points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const [lastX, lastY] = points.at(-1)!;
  const area = `M${points[0]![0]} ${height - 2} L${line.replace(/ /g, " L")} L${lastX} ${height - 2} Z`;
  const alert = tone === "alert";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path d={area} className={cn(alert ? "fill-alert" : "fill-green-600", "opacity-8")} />
      <polyline points={line} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className="stroke-green-600" />
      <circle cx={lastX} cy={lastY} r={4.5} className={alert || endTone === "alert" ? "fill-alert" : "fill-green-600"} />
    </svg>
  );
}
