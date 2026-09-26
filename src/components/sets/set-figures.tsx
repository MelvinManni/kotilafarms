// Headline figures for one Set; mortality turns alert-coloured only when this week is worse than last
import { Delta } from "@/components/kotila/delta";
import { Figure } from "@/components/kotila/figure";
import type { SetDetail } from "@/types/sets";
import { perBirdStarted } from "@/utils/metrics/category-share";
import { count } from "@/utils/format/count";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";

export function SetFigures({ set }: { set: SetDetail }) {
  const worse = set.status !== "closed" && set.trend.thisWeek > set.trend.lastWeek;
  const perBird = set.money ? perBirdStarted(set.money.spend, set.intake) : null;
  return (
    <div className="grid grid-cols-2 gap-5 rounded-xl border border-line bg-surface px-6 py-5 lg:grid-cols-4">
      <Figure label="Live birds" value={count(set.liveBirds)} sub={`of ${count(set.intake)} started`} />
      <Figure
        label="Mortality"
        value={pct(set.mortalityRate)}
        tone={worse ? "alert" : undefined}
        sub={`${count(set.deaths)} ${set.deaths === 1 ? "bird" : "birds"}`}
        delta={
          set.status === "closed" ? undefined : (
            <Delta
              direction={set.trend.thisWeek > set.trend.lastWeek ? "up" : set.trend.thisWeek < set.trend.lastWeek ? "down" : "flat"}
              goodWhen="down"
              tooltip={`${set.trend.lastWeek} last week. Running average ${set.trend.perWeekAverage.toFixed(1)} a week.`}
            >
              {set.trend.thisWeek} this week
            </Delta>
          )
        }
      />
      <Figure label="Age" value={`Day ${set.dayOfAge}`} sub={set.closedOn ? `closed ${shortDate(set.closedOn, false)}` : `started ${shortDate(set.startDate, false)}`} />
      {set.money ? <Figure label={set.status === "closed" ? "Spent" : "Spend to date"} value={naira(set.money.spend)} sub={perBird === null ? undefined : `${naira(perBird)} per bird started`} /> : null}
    </div>
  );
}
