// Tests for growth maths
import { describe, expect, it } from "vitest";
import { averageDailyGain, gapToStandard, interpolateStandard, projectWeight } from "@/utils/metrics/growth";

const curve = [
  { day: 0, weight: 42 },
  { day: 7, weight: 190 },
  { day: 14, weight: 480 },
];

describe("growth", () => {
  it("interpolates between curve points", () => expect(interpolateStandard(curve, 10.5)).toBe(335));
  it("holds the ends of the curve", () => {
    expect(interpolateStandard(curve, -1)).toBe(42);
    expect(interpolateStandard(curve, 30)).toBe(480);
  });
  it("works out daily gain", () => expect(averageDailyGain({ day: 14, weight: 400 }, { day: 21, weight: 841 })).toBe(63));
  it("projects forward at the latest gain", () => expect(projectWeight({ day: 14, weight: 400 }, { day: 21, weight: 841 }, 28)).toBe(1282));
  it("gives the gap to standard as a ratio", () => expect(gapToStandard(896, 1000)).toBeCloseTo(-0.104));
  it("returns NaN rather than dividing by zero", () => {
    expect(gapToStandard(900, 0)).toBeNaN();
    expect(averageDailyGain({ day: 7, weight: 1 }, { day: 7, weight: 2 })).toBeNaN();
  });
});
