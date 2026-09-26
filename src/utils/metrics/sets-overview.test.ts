// Tests for the Sets page headline numbers (Sets 1–5 from docs/12-seed-data.md)
import { describe, expect, it } from "vitest";
import type { SetSummary } from "@/types/sets";
import { setsOverview } from "@/utils/metrics/sets-overview";

const set = (number: number, status: SetSummary["status"], liveBirds: number, birdsSold: number, profit?: number, margin?: number, intake = 500): SetSummary => ({
  id: String(number), number, name: null, pen: null, status, startDate: "2026-01-01", closedOn: null, intake, dayOfAge: 0, deaths: 0,
  mortalityRate: 0, birdsSold, liveBirds, trend: { thisWeek: 0, lastWeek: 0, perWeekAverage: 0 },
  money: profit === undefined ? undefined : { spend: 0, revenue: 0, profit, margin: margin ?? null },
});

describe("setsOverview", () => {
  it("matches the Sets page design", () => {
    const o = setsOverview([
      set(5, "brooding", 597, 0, 0),
      set(4, "growing", 482, 0, 0),
      set(3, "closed", 0, 465, 568_750, 0.1596),
      set(2, "closed", 0, 281, 367_000, 0.1765, 300),
      set(1, "closed", 0, 181, 92_900, 0.0721, 200),
    ]);
    expect(o).toEqual({ liveBirds: 1_079, runningNumbers: [4, 5], birdsSold: 927, closedProfit: 1_028_650, best: { number: 2, margin: 0.1765, intake: 300 } });
  });
  it("hides money when there is none", () => expect(setsOverview([set(1, "closed", 0, 10)]).closedProfit).toBeNull());
});
