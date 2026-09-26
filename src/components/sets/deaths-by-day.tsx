// Deaths per day of age as small bars: last 7 days darker, days not logged yet outlined
import type { SetDetail } from "@/types/sets";
import { addDays } from "@/utils/dates/add-days";
import { cn } from "@/utils/cn";

export function DeathsByDay({ set, today }: { set: SetDetail; today: string }) {
  if (set.dayOfAge < 1) return <p className="m-0 text-body text-ink-muted">Day-olds arrived today. Each day’s deaths show here once it is logged.</p>;
  const byDate = new Map(set.deathsByDay.map((d) => [d.date, d.deaths]));
  const days = Array.from({ length: Math.max(1, set.dayOfAge) }, (_, i) => i + 1);
  const max = Math.max(1, ...set.deathsByDay.map((d) => d.deaths));
  const recentFrom = set.dayOfAge - 6;
  const recent = days.filter((d) => d >= recentFrom).reduce((n, d) => n + (byDate.get(addDays(set.startDate, d)) ?? 0), 0);
  const missing = days.filter((d) => !byDate.has(addDays(set.startDate, d)) && addDays(set.startDate, d) <= today);
  return (
    <div className="flex flex-col gap-3">
      <div role="img" aria-label={`Deaths by day of age for Set ${set.number}, days 1 to ${set.dayOfAge}. ${set.deaths} in total, ${recent} in the last 7 days.`} className="flex h-30 items-end gap-0.75">
        {days.map((d) => {
          const deaths = byDate.get(addDays(set.startDate, d));
          const label = deaths === undefined ? `Day ${d}: not in yet` : `Day ${d}: ${deaths} ${deaths === 1 ? "death" : "deaths"}`;
          return (
            <div
              key={d}
              title={label}
              className={cn(
                "min-w-0 flex-1 rounded-t-[3px]",
                deaths === undefined ? "h-full border border-dashed border-line-strong bg-transparent" : d >= recentFrom ? "bg-ink" : "bg-bar-soft",
              )}
              style={deaths === undefined ? undefined : { height: `${Math.max(4, (deaths / max) * 100)}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-caption text-ink-muted">
        <span>Day 1</span>
        <span>Day {set.dayOfAge}</span>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-caption text-ink-2">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-ink" />Last 7 days · {recent}</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-bar-soft" />Earlier · {set.deaths - recent}</span>
        {missing.length ? <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-dashed border-line-strong" />{missing.length} {missing.length === 1 ? "day" : "days"} not in yet</span> : null}
      </div>
    </div>
  );
}
