// Weekly review rules on Set 4 (week of 20–26 Sep) and Set 5 (all well)
import { describe, expect, it } from "vitest";
import type { FeedStockRow } from "@/types/feed";
import type { SetVaccineRow } from "@/types/health";
import { addDays } from "@/utils/dates/add-days";
import { weekOf } from "@/utils/dates/week-of";
import { setReview } from "@/utils/metrics/weekly/set-review";
import { weekFacts } from "@/utils/metrics/weekly/week-facts";

const STANDARD = [{ day: 0, grams: 42 }, { day: 7, grams: 190 }, { day: 14, grams: 480 }, { day: 21, grams: 930 }, { day: 24, grams: 1150 }, { day: 28, grams: 1500 }, { day: 35, grams: 2200 }, { day: 42, grams: 2850 }];
const week = weekOf("2026-09-26");
const vaccine = (over: Partial<SetVaccineRow>): SetVaccineRow => ({ id: "v", item: "Gumboro", doseNo: 1, dueAgeDays: 7, dueOn: "2026-09-09", method: "Drinking water", givenOn: "2026-09-09", givenDay: 7, givenBy: "Adaeze", note: null, state: "given", daysLate: 0, version: 1, ...over });

// Set 4: 10 deaths in week one, 1 a week after, 2 last week, 4 this week; wet litter 3 days; every day logged
function set4Logs() {
  const deathsByDay: Record<number, number> = { 1: 4, 2: 3, 3: 2, 5: 1, 9: 1, 12: 1, 14: 1, 16: 1, 19: 1, 21: 2, 23: 1 };
  return Array.from({ length: 24 }, (_, i) => {
    const day = i + 1;
    const date = addDays("2026-09-02", day);
    return { date, deaths: deathsByDay[day] ?? 0, tags: [20, 22, 24].includes(day) ? ["wet_litter"] : [], deathCause: null, feedKg: day * 2 };
  });
}

describe("weekly review", () => {
  it("names week and runs Sunday to Saturday", () => {
    expect(weekOf("2026-09-23")).toEqual({ start: "2026-09-20", end: "2026-09-26" });
  });

  it("writes Set 4's points, worst first, each with something to do", () => {
    const facts = weekFacts({ set: { number: 4, pen: "Back pen", startDate: "2026-09-02", intake: 500, sold: 0 }, week, logs: set4Logs(), samples: [{ ageDays: 14, averageGrams: 455 }, { ageDays: 21, averageGrams: 840 }, { ageDays: 24, averageGrams: 1030 }], standard: STANDARD, feedSpend: 400_000 });
    expect(facts.deaths).toMatchObject({ week: 4, lastWeek: 3, total: 18 });
    const finisher: FeedStockRow = { feedTypeId: "f", feed: "Finisher · Ultima", kind: "finisher", stockBags: 9, bagsPerDay: 2.3, daysLeft: 9 / 2.3, eating: [{ id: "s4", number: 4 }], lastPrice: 24_800 };
    const review = setReview({ number: 4, intake: 500, facts, week, feed: [finisher], vaccines: [vaccine({ givenOn: "2026-09-11", givenDay: 9, state: "given-late", daysLate: 2 })] });
    expect(review.title).toBe("Set 4: weight is slipping and deaths are up");
    expect(review.points.map((p) => p.problem)).toEqual(["weight is slipping", "deaths are up", "wet litter keeps coming back", "finisher runs out soon"]);
    expect(review.points[0]!.text).toBe("Birds are 10.4% under the standard at day 24, from 9.7% at day 21. They gained 63 g a day since day 21; the standard needs about 95 g. At this rate they reach 1.73 kg at day 35, not 2.20 kg.");
    expect(review.points[0]!.action).toMatch(/^check feeder space — 1 feeder per 25 birds, so 20 feeders for 482 —/);
    expect(review.points[3]!.text).toBe("Finisher is down to 9 bags and the birds eat 2.3 bags a day, so it runs out in about 3 days, around Tuesday.");
    expect(review.points[3]!.action).toBe("order 25 bags by Sunday. At the last price of ₦24,800 a bag that is ₦620,000.");
  });

  it("counts a long run of missing logs instead of naming every day", () => {
    const facts = weekFacts({ set: { number: 6, pen: null, startDate: "2026-09-12", intake: 300, sold: 0 }, week, logs: [{ date: "2026-09-25", deaths: 0, tags: [], deathCause: null, feedKg: null }], samples: [], standard: STANDARD, feedSpend: 0 });
    const review = setReview({ number: 6, intake: 300, facts, week, feed: [], vaccines: [] });
    expect(review.points[0]!.text).toBe("No daily log for 6 days this week, since Sunday.");
  });

  it("says one line when nothing is wrong", () => {
    const logs = [1, 2, 3, 4, 5, 6].map((day) => ({ date: addDays("2026-09-20", day), deaths: day <= 2 ? [2, 1][day - 1]! : 0, tags: [], deathCause: null, feedKg: 20 }));
    const facts = weekFacts({ set: { number: 5, pen: "Front pen", startDate: "2026-09-20", intake: 600, sold: 0 }, week, logs, samples: [], standard: STANDARD, feedSpend: 0 });
    const review = setReview({ number: 5, intake: 600, facts, week, feed: [], vaccines: [vaccine({ dueOn: "2026-09-27", givenOn: null, givenDay: null, state: "due-tomorrow" })] });
    expect(review).toEqual({ title: "Set 5: nothing to worry about this week.", points: [], allWell: "3 deaths in the first 6 days (0.5%). Gumboro 1st dose is due tomorrow." });
  });
});
