// Set 4 at day 24 (docs/12-seed-data.md): 1.03 kg, 78% uniform, 10.4% under, 63 g a day
import { describe, expect, it } from "vitest";
import { DEFAULT_STANDARD_KG } from "@/constants/breed-standard";
import { sampleStats } from "@/utils/metrics/sample-stats";

const standard = DEFAULT_STANDARD_KG.map((p) => ({ day: p.day, grams: p.kg * 1000 }));
const DAY_24 = [880, 900, 960, 980, 990, 1000, 1010, 1020, 1030, 1030, 1040, 1050, 1060, 1070, 1080, 1080, 1170, 1190];

describe("sampleStats", () => {
  it("matches the Set 4 numbers", () => {
    const s = sampleStats(DAY_24, 24, standard, { ageDays: 21, averageGrams: 840 });
    expect(s).toMatchObject({ count: 18, averageGrams: 1030, standardGrams: 1150, dailyGainGrams: 63 });
    expect(Math.round(s.uniformity * 100)).toBe(78);
    expect(s.gap).toBeCloseTo(-0.104, 3);
  });
  it("copes with no weights yet", () => expect(sampleStats([], 24, standard)).toMatchObject({ count: 0, averageGrams: 0, gap: null }));
});
