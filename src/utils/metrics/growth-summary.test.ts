// Set 4's growth story (design: SetDetail, Dashboard): 10% under at day 24 and widening
import { describe, expect, it } from "vitest";
import { growthHeadline } from "@/utils/metrics/growth-headline";
import { growthSummary, latestPerDay } from "@/utils/metrics/growth-summary";

const STANDARD = [{ day: 0, grams: 42 }, { day: 7, grams: 190 }, { day: 14, grams: 480 }, { day: 21, grams: 930 }, { day: 24, grams: 1150 }, { day: 28, grams: 1500 }, { day: 35, grams: 2200 }, { day: 42, grams: 2850 }];
const sample = (ageDays: number, averageGrams: number) => ({ ageDays, averageGrams, count: 24, uniformity: 0.78 });
const SET4 = [sample(7, 176), sample(14, 455), sample(21, 840), sample(24, 1030)];

describe("growthSummary", () => {
  it("reads Set 4 at day 24", () => {
    const g = growthSummary(SET4, STANDARD)!;
    expect(g).toMatchObject({ day: 24, averageGrams: 1030, standardGrams: 1150, trend: "widening", dailyGainGrams: 63, standardGainGrams: 95, late: false });
    expect(g.gap).toBeCloseTo(-0.104, 3);
    expect(g.projected!.grams).toBe(1727);
    expect(Math.round(g.projected!.gap * 100)).toBe(-22);
  });

  it("has nothing to say before the first sample", () => {
    expect(growthSummary([], STANDARD)).toBeNull();
  });

  it("keeps one point per day, the later one", () => {
    expect(latestPerDay([sample(7, 170), sample(7, 180)]).map((s) => s.averageGrams)).toEqual([180]);
  });
});

describe("growthHeadline", () => {
  it("states the finding and what to do", () => {
    const h = growthHeadline(growthSummary(SET4, STANDARD)!);
    expect(h.title).toBe("10% under weight at day 24, and the gap is widening");
    expect(h.subtitle).toBe("It was 5% under at day 14. Check feeder space and finisher intake this week, while there is still time to close it.");
    expect(growthHeadline(growthSummary(SET4, STANDARD)!, 4).title).toBe("Set 4 is 10% under weight at day 24 — and the gap is widening");
  });

  it("says when a Set is on the standard, or late to recover", () => {
    expect(growthHeadline(growthSummary([sample(14, 470)], STANDARD)!).title).toBe("Growing on the standard at day 14");
    expect(growthHeadline(growthSummary([sample(30, 1400)], STANDARD)!).subtitle).toContain("After day 28 it is hard to recover.");
  });
});
