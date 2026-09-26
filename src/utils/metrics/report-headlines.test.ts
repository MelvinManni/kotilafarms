// Set report wording (design: SetReport, Set 3)
import { describe, expect, it } from "vitest";
import type { SetReportPayload } from "@/types/report";
import { setNames } from "@/utils/format/set-names";
import { growthNote, reportFootnote, reportPeriod, reportTitle } from "@/utils/metrics/report-headlines";
import { setPnl } from "@/utils/metrics/set-pnl";

const set3 = {
  sets: [{ id: "3", number: 3, startDate: "2026-07-20", closedOn: "2026-09-14", status: "closed" }],
  intake: 500, birdsSold: 465, birdRevenue: 3_547_650, manureRevenue: 15_900,
  pnl: setPnl({ intake: 500, birdsSold: 465, birdRevenue: 3_547_650, manureRevenue: 15_900, expensesByCategory: { Feed: 2_994_800 } }),
  byCategory: [], feedShare: 1, prepared: "2026-09-26", period: { from: "2026-07-20", to: "2026-09-14" }, deaths: 35, liveBirds: 0,
  saleWeight: { averageGrams: 2_460, day: 42 }, performance: { feedKg: 1_990, feedSpend: 2_066_412, liveKg: 1_143.9, fcr: 1.74, feedCostPerKg: 1_806 },
  growth: { samples: [{ day: 7, grams: 190 }, { day: 42, grams: 2_460 }], standard: [{ day: 0, grams: 42 }, { day: 42, grams: 2_850 }] },
  largestExpenses: { rows: [], of: 58 }, unpaid: { count: 3, total: 412_000 },
} satisfies SetReportPayload;

describe("report headlines", () => {
  it("reads like the design", () => {
    expect(reportTitle(set3)).toBe("Set 3 made ₦568,750 on 500 day-olds");
    expect(reportPeriod(set3)).toBe("Set 3 report · 20 July – 14 September 2026 · prepared 26 Sep 2026");
    expect(growthNote(set3.growth, 3)).toBe("Weighed 2 times. The last weighing, 2.46 kg at day 42, was 14% under the standard.");
    expect(reportFootnote(set3)).toBe("Figures from the farm records as of 26 Sep 2026. Set 3 had 3 unpaid balances (₦412,000); they are counted in revenue.");
  });

  it("names Sets together", () => {
    expect(setNames([3, 1, 2])).toBe("Sets 1–3");
    expect(setNames([1, 3, 5])).toBe("Sets 1, 3 and 5");
  });
});
