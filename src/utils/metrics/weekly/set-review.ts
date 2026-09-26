// One Set's weekly review: a title that names the problems, the points, or one line when all is well
import type { FeedStockRow } from "@/types/feed";
import type { SetVaccineRow } from "@/types/health";
import { addDays } from "@/utils/dates/add-days";
import { pct } from "@/utils/format/percent";
import { doseLabel } from "@/utils/metrics/vaccine-status";
import { reviewPoints, type ReviewPoint } from "@/utils/metrics/weekly/review-points";
import type { WeekFacts } from "@/utils/metrics/weekly/week-facts";

export type SetReview = { title: string; points: ReviewPoint[]; allWell: string | null };

type Input = { number: number; intake: number; facts: WeekFacts; week: { start: string; end: string }; feed: FeedStockRow[]; vaccines: SetVaccineRow[] };

export function setReview({ number, intake, facts, week, feed, vaccines }: Input): SetReview {
  const points = reviewPoints({ facts, intake, week, feed, vaccines });
  if (points.length) {
    const [a, b] = points;
    return { title: `Set ${number}: ${a!.problem}${b && b.problem !== a!.problem ? ` and ${b.problem}` : ""}`, points, allWell: null };
  }
  const due = vaccines.find((v) => !v.givenOn && v.dueOn > week.end && v.dueOn <= addDays(week.end, 2));
  const dueText = due ? ` ${due.item} ${doseLabel(due.doseNo)} is due ${due.dueOn === addDays(week.end, 1) ? "tomorrow" : "in 2 days"}.` : "";
  const deaths = `${facts.deaths.total} ${facts.deaths.total === 1 ? "death" : "deaths"} in the first ${facts.day} days (${pct(facts.deaths.total / intake)}).`;
  return { title: `Set ${number}: nothing to worry about this week.`, points: [], allWell: `${deaths}${dueText}` };
}
