// Horizontal bars for a breakdown, largest first, top bar emphasised
import { naira } from "@/utils/format/naira";
import { count } from "@/utils/format/count";
import { cn } from "@/utils/cn";

type BarListProps = { items: { label: string; value: number }[]; format?: "naira" | "plain"; emphasizeFirst?: boolean };

export function BarList({ items, format = "naira", emphasizeFirst = true }: BarListProps) {
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
  const max = Math.max(1, ...items.map((it) => it.value));
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => (
        <div key={it.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1">
          <span className="text-body text-ink-2">{it.label}</span>
          <span className="text-[17px] leading-6 font-bold tabular-nums">
            {format === "plain" ? count(it.value) : naira(it.value)}
            <span className="ml-2 text-caption font-semibold text-ink-muted">{((it.value / total) * 100).toFixed(0)}%</span>
          </span>
          <div className="col-span-full h-2.5 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className={cn("h-full rounded-full", i === 0 && emphasizeFirst ? "bg-green-600" : "bg-bar-soft")}
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
