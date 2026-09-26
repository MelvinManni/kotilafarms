// Tests for farm day maths
import { describe, expect, it } from "vitest";
import { addDays } from "@/utils/dates/add-days";
import { daysBetween } from "@/utils/dates/days-between";
import { todayInZone } from "@/utils/dates/today-in-zone";

describe("farm days", () => {
  it("adds days across months", () => expect(addDays("2026-09-26", 7)).toBe("2026-10-03"));
  it("subtracts days", () => expect(addDays("2026-09-02", -3)).toBe("2026-08-30"));
  it("counts days between", () => expect(daysBetween("2026-09-02", "2026-09-26")).toBe(24));
  it("reads today in Lagos, not UTC", () => {
    // 23:30 UTC on the 25th is already 00:30 on the 26th in Lagos
    expect(todayInZone("Africa/Lagos", new Date("2026-09-25T23:30:00Z"))).toBe("2026-09-26");
  });
});
