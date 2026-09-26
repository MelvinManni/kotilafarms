// Price per bag over the last purchases: each price labelled, the latest move in alert when it went up
import type { PricePoint } from "@/utils/metrics/price-trend";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

const W = 720;
const H = 200;
const LEFT = 70;
const RIGHT = 690;
const TOP = 20;
const BOTTOM = 170;
const STEP = 1000;

export function PriceChart({ points, label }: { points: PricePoint[]; label: string }) {
  if (points.length === 0) return null;
  const prices = points.map((p) => p.pricePerBag);
  const lo = Math.floor(Math.min(...prices) / STEP) * STEP;
  const hi = Math.max(lo + 2 * STEP, Math.ceil(Math.max(...prices) / STEP) * STEP);
  const ticks = Array.from({ length: Math.min(6, (hi - lo) / STEP + 1) }, (_, i) => lo + ((hi - lo) * i) / Math.min(5, (hi - lo) / STEP));
  const x = (i: number) => (points.length === 1 ? (LEFT + RIGHT) / 2 : LEFT + ((RIGHT - 20 - LEFT) * i) / (points.length - 1));
  const y = (p: number) => BOTTOM - ((p - lo) / (hi - lo)) * (BOTTOM - TOP);
  const last = points.length - 1;
  const rose = last > 0 && prices[last]! > prices[last - 1]!;
  const line = points.slice(0, rose ? last : undefined).map((p, i) => `${x(i)},${y(p.pricePerBag)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full font-sans">
      {ticks.map((t, i) => (
        <g key={t}>
          <line x1={LEFT} x2={RIGHT} y1={y(t)} y2={y(t)} strokeWidth={1} className={i === 0 ? "stroke-line-strong" : "stroke-line-soft"} />
          <text x={LEFT - 12} y={y(t) + 4} fontSize={12} textAnchor="end" className="fill-ink-muted">{naira(t)}</text>
        </g>
      ))}
      <polyline points={line} fill="none" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" className="stroke-green-600" />
      {rose ? <line x1={x(last - 1)} y1={y(prices[last - 1]!)} x2={x(last)} y2={y(prices[last]!)} strokeWidth={3} strokeLinecap="round" className="stroke-alert" /> : null}
      {points.map((p, i) => {
        const isLast = i === last;
        return (
          <g key={`${p.date}-${i}`}>
            <circle cx={x(i)} cy={y(p.pricePerBag)} r={isLast ? 6 : 4.5} strokeWidth={isLast ? 2 : 2.5} className={isLast && rose ? "fill-alert stroke-white" : "fill-white stroke-green-600"} />
            <text x={isLast ? x(i) + 22 : x(i)} y={isLast ? y(p.pricePerBag) - 15 : y(p.pricePerBag) - 12} fontSize={isLast ? 14 : 13} fontWeight={isLast ? 800 : 700} textAnchor={isLast ? "end" : "middle"} className={isLast && rose ? "fill-alert" : "fill-ink"}>
              {naira(p.pricePerBag)}
            </text>
            <text x={x(i)} y={H - 8} fontSize={12} textAnchor="middle" className="fill-ink-muted">{shortDate(p.date, false)}</text>
          </g>
        );
      })}
    </svg>
  );
}
