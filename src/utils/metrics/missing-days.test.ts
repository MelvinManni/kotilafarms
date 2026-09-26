// Tests for missed-day detection and the deaths alert line
import { describe, expect, it } from "vitest";
import { deathsAlertAbove, missingDays } from "@/utils/metrics/missing-days";

describe("missingDays", () => {
  it("Set 5 is missing Friday", () => {
    expect(missingDays("2026-09-20", null, "2026-09-26", ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24"])).toEqual(["2026-09-25"]);
  });
  it("doesn't ask for today or arrival day", () => expect(missingDays("2026-09-25", null, "2026-09-26", [])).toEqual([]));
  it("stops at the closing day", () => expect(missingDays("2026-09-01", "2026-09-03", "2026-09-26", ["2026-09-02"])).toEqual(["2026-09-03"]));
});

describe("deathsAlertAbove", () => {
  it("uses yesterday when it's higher", () => expect(deathsAlertAbove(1, 18, 24)).toBe(1));
  it("uses the average when it's higher", () => expect(deathsAlertAbove(0, 30, 10)).toBe(3));
});
