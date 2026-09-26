// Set 4 at day 24 (docs/12-seed-data.md): weights, uniformity, gain and gap to standard
import { describe, expect, it } from "vitest";
import { averageDailyGain, gapToStandard, projectWeight } from "@/utils/metrics/growth";
import { averageWeight, coefficientOfVariation, uniformity } from "@/utils/metrics/weight-sample";

// 18 birds, mean 1,030 g: 14 within ±10%
const DAY_24 = [880, 900, 960, 980, 990, 1000, 1010, 1020, 1030, 1030, 1040, 1050, 1060, 1070, 1080, 1080, 1170, 1190];

describe("Set 4 growth", () => {
  it("averages 1.03 kg with 78% uniformity", () => {
    expect(averageWeight(DAY_24)).toBe(1030);
    expect(Math.round(uniformity(DAY_24) * 100)).toBe(78);
    expect(coefficientOfVariation(DAY_24)).toBeGreaterThan(0.05);
  });

  it("gains 63 g a day since day 21 and is 10.4% under the 1.15 kg standard", () => {
    expect(Math.round(averageDailyGain({ day: 21, weight: 840 }, { day: 24, weight: 1030 }))).toBe(63);
    expect(gapToStandard(1030, 1150)).toBeCloseTo(-0.104, 3);
  });

  it("heads for about 1.72 kg at day 35, 22% under 2.20 kg", () => {
    const projected = projectWeight({ day: 21, weight: 840 }, { day: 24, weight: 1030 }, 35);
    expect(projected / 1000).toBeCloseTo(1.72, 1);
    expect(Math.round(gapToStandard(projected, 2200) * 100)).toBe(-22);
  });
});
