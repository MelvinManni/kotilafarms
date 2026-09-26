// Four figures for a Set that needs attention: deaths, weight against the standard, FCR, feed cost per kg
import { Delta } from "@/components/kotila/delta";
import { Figure } from "@/components/kotila/figure";
import { MARKET_DAY } from "@/constants/farm";
import { decimal } from "@/utils/format/decimal";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { kg } from "@/utils/format/weight";
import type { WeekFacts } from "@/utils/metrics/weekly/week-facts";

export function WeeklyFigures({ f }: { f: WeekFacts }) {
  const d = f.deaths;
  const w = f.weight;
  const up = d.week > d.lastWeek;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 print:grid-cols-4">
      <div className="flex flex-col items-start gap-1.5">
        <Figure label="Deaths this week" value={String(d.week)} sub={d.perWeek !== null ? `avg ${decimal(d.perWeek, 1)} a week` : "first weeks"} tone={up && d.week >= 3 ? "alert" : undefined} />
        {d.week !== d.lastWeek ? <Delta direction={up ? "up" : "down"} goodWhen="down">from {d.lastWeek}</Delta> : null}
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <Figure label="Weight vs standard" value={w ? pct(w.gap, 1, { signed: true }) : "—"} sub={w ? `${kg(w.grams)} against ${kg(w.standard)}` : "not weighed yet"} />
        {w?.before ? <Delta direction={w.gap < w.before.gap ? "down" : "up"} goodWhen="up">from {pct(w.before.gap, 1, { signed: true })} at day {w.before.day}</Delta> : null}
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <Figure label="FCR so far" value={f.fcr ? decimal(f.fcr.now, 2) : "—"} sub="feed kg ÷ live weight kg" />
        {f.fcr?.projected ? <Delta direction={f.fcr.projected > f.fcr.now ? "up" : "down"} goodWhen="down">heading for {decimal(f.fcr.projected, 2)} at day {MARKET_DAY}</Delta> : null}
      </div>
      <Figure label="Feed cost per kg live weight" value={f.feedCostPerKg === null ? "—" : naira(f.feedCostPerKg)} sub="feed spend ÷ live weight" />
    </div>
  );
}
