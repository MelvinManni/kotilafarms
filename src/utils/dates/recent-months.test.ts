// Tests for the month picker list
import { describe, expect, it } from "vitest";
import { monthName, recentMonths } from "@/utils/dates/recent-months";

describe("recentMonths", () => {
  it("goes back across the year", () => expect(recentMonths("2026-02-10", 3)).toEqual([
    { value: "2026-02", label: "February 2026" }, { value: "2026-01", label: "January 2026" }, { value: "2025-12", label: "December 2025" },
  ]));
  it("names a month", () => expect(monthName("2026-09")).toBe("September"));
});
