// Tests for the weekly death comparison and day of age
import { describe, expect, it } from "vitest";
import { dayOfAge, mortalityTrend } from "@/utils/metrics/mortality-trend";
import { addDays } from "@/utils/dates/add-days";

// Set 4 from docs/12-seed-data.md: deaths for days 0–23, started 2 Sep
const DEATHS = [0, 3, 2, 2, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1];
const logs = DEATHS.map((deaths, day) => ({ date: addDays("2026-09-02", day), deaths }));

describe("mortalityTrend", () => {
  it("Set 4: 4 this week, 2 last week, 18 in all", () => {
    const t = mortalityTrend(logs, "2026-09-02", "2026-09-26");
    expect(t).toMatchObject({ thisWeek: 4, lastWeek: 2, total: 18 });
    expect(t.perWeekAverage).toBeCloseTo(5.04, 2);
  });
});

describe("dayOfAge", () => {
  it("counts from day 0", () => expect(dayOfAge("2026-09-02", "2026-09-26")).toBe(24));
  it("stops at closing", () => expect(dayOfAge("2026-07-20", "2026-09-26", "2026-09-14")).toBe(56));
});
