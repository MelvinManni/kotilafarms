// Rules that turn a week's facts into short points, each ending in something to do
import { TAG_ADVICE } from "@/constants/tag-advice";
import { tagLabel, type ObservationTag } from "@/constants/observation-tags";
import type { FeedStockRow } from "@/types/feed";
import type { SetVaccineRow } from "@/types/health";
import { addDays } from "@/utils/dates/add-days";
import { bags } from "@/utils/format/bags";
import { count } from "@/utils/format/count";
import { decimal } from "@/utils/format/decimal";
import { weekdayName } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { kg } from "@/utils/format/weight";
import { doseLabel } from "@/utils/metrics/vaccine-status";
import type { WeekFacts } from "@/utils/metrics/weekly/week-facts";

export type ReviewPoint = { severity: number; problem: string; text: string; action: string };

type Context = { facts: WeekFacts; intake: number; week: { start: string; end: string }; feed: FeedStockRow[]; vaccines: SetVaccineRow[] };

const under = (gap: number) => `${pct(Math.abs(gap))} ${gap < 0 ? "under" : "over"}`;
const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;
const joinList = (list: string[]) => (list.length === 1 ? list[0]! : `${list.slice(0, -1).join(", ")} and ${list.at(-1)}`);

export function reviewPoints({ facts: f, intake, week, feed, vaccines }: Context): ReviewPoint[] {
  const points: ReviewPoint[] = [];

  for (const { tag, days: n } of f.tags.filter((t) => t.days >= 3)) {
    const advice = TAG_ADVICE[tag as ObservationTag];
    if (advice) points.push({ severity: 3, problem: advice.problem, text: `${tagLabel(tag)} was logged ${days(n)} this week.`, action: advice.action });
  }

  const w = f.weight;
  if (w && w.gap < -0.05) {
    const widening = w.before !== null && w.gap < w.before.gap - 0.002;
    const gain = w.gain !== null && w.standardGain !== null ? ` They gained ${w.gain} g a day since day ${w.before!.day}; the standard needs about ${w.standardGain} g.` : "";
    const heading = w.projected ? ` At this rate they reach ${kg(w.projected)} at day 35, not ${kg(w.projectedStandard)}.` : "";
    points.push({
      severity: 4,
      problem: widening ? "weight is slipping" : "weight is behind the standard",
      text: `Birds are ${under(w.gap)} the standard at day ${w.day}${w.before ? `, from ${pct(Math.abs(w.before.gap))} at day ${w.before.day}` : ""}.${gain}${heading}`,
      action: `check feeder space — 1 feeder per 25 birds, so ${Math.ceil(f.live / 25)} feeders for ${count(f.live)} — and that feed is in the feeders all day, not only morning and evening.`,
    });
  }

  for (const r of feed.filter((x) => x.daysLeft !== null && x.daysLeft <= 7)) {
    const kind = r.feed.split(" · ")[0]!;
    const left = Math.floor(r.daysLeft!);
    const order = Math.max(5, Math.ceil((r.bagsPerDay * 14 - Math.max(0, r.stockBags)) / 5) * 5);
    const by = weekdayName(addDays(week.end, Math.max(0, left - 2)));
    const cost = r.lastPrice ? ` At the last price of ${naira(r.lastPrice)} a bag that is ${naira(order * r.lastPrice)}.` : "";
    points.push({
      severity: left < 3 ? 5 : 3,
      problem: `${kind.toLowerCase()} runs out soon`,
      text: `${kind} is down to ${bags(Math.max(0, r.stockBags))} and the birds eat ${decimal(r.bagsPerDay, 1)} bags a day, so it runs out in about ${days(left)}, around ${weekdayName(addDays(week.end, left))}.`,
      action: `order ${order} bags by ${by}.${cost}`,
    });
  }

  const d = f.deaths;
  // A Set's first week has nothing to compare with
  if (d.week >= 3 && d.week > d.lastWeek && (d.perWeek !== null ? d.week > d.perWeek * 1.25 : d.lastWeek > 0)) {
    points.push({
      severity: 4,
      problem: d.lastWeek > 0 && d.week >= d.lastWeek * 2 ? "deaths doubled" : "deaths are up",
      text: `Deaths were ${d.week} this week, up from ${d.lastWeek}${d.perWeek !== null ? ` and above the running average of ${decimal(d.perWeek, 1)}` : ""}. The Set has lost ${pct(d.total / intake)} so far.`,
      action: d.noCause ? "note a cause for every death in the daily log, so a pattern shows early." : "walk the pen morning and evening and take out weak birds early.",
    });
  }

  const names = (list: SetVaccineRow[]) => joinList(list.map((v) => `${v.item} ${doseLabel(v.doseNo)}`));
  const late = vaccines.filter((v) => v.state === "late");
  if (late.length) {
    const one = late.length === 1;
    points.push({ severity: 5, problem: one ? "a vaccine is late" : "vaccines are late", text: `${names(late)} ${one ? `is ${days(late[0]!.daysLate)} late (due day ${late[0]!.dueAgeDays})` : "are late"}.`, action: `give ${one ? "it" : "the next one"} tomorrow morning in ${late[0]!.method.toLowerCase()}, and mark ${one ? "it" : "each"} given.` });
  }
  const lateInWeek = vaccines.filter((v) => v.state === "given-late" && v.givenOn && v.givenOn >= week.start && v.givenOn <= week.end);
  if (lateInWeek.length) {
    const v = lateInWeek[0]!;
    const text = lateInWeek.length === 1 ? `The ${names(lateInWeek)} was given on day ${v.givenDay}, ${days(v.daysLate)} late.` : `${names(lateInWeek)} went in late this week.`;
    points.push({ severity: 2, problem: "a vaccine went in late", text, action: "watch this week for dull, huddled birds or watery droppings, and tell the owner the same day." });
  }

  if (f.missedDays.length) {
    const missed = f.missedDays.length > 3 ? `${f.missedDays.length} days this week, since ${weekdayName(f.missedDays[0]!)}` : joinList(f.missedDays.map((x) => weekdayName(x)));
    points.push({ severity: 2, problem: "logs are missing", text: `No daily log for ${missed}.`, action: "fill them in today. Guess if you must — a count is better than nothing." });
  }

  return points.sort((a, b) => b.severity - a.severity).slice(0, 6);
}
