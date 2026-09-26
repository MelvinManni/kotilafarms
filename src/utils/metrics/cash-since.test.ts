// Cash position since the last count (design: Finance, ₦1,284,750 should be on hand)
import { describe, expect, it } from "vitest";
import { cashSince, reconcileDifference } from "@/utils/metrics/cash-since";

const inLines = [
  { date: "2026-09-10", amount: 1_414_300, group: "Bird and manure sales" },
  { date: "2026-09-05", amount: 500_000, group: "Shareholder loan from Kosi" },
  { date: "2026-09-03", amount: 250_000, group: "Partner capital from Queen" },
  { date: "2026-08-30", amount: 999_999, group: "Bird and manure sales" },
];
const outLines = [
  { date: "2026-09-22", amount: 496_000, group: "Feed" },
  { date: "2026-09-12", amount: 383_550, group: "Other" },
  { date: "2026-09-01", amount: 50_000, group: "Feed" },
];

describe("cashSince", () => {
  it("counts only what moved after the last reconciliation day", () => {
    const c = cashSince(inLines, outLines, { date: "2026-09-01", actual: 0 });
    expect(c).toMatchObject({ moneyIn: 2_164_300, moneyOut: 879_550, shouldBeOnHand: 1_284_750 });
    expect(c.outByGroup).toEqual([{ label: "Feed", value: 496_000 }, { label: "Other", value: 383_550 }]);
  });

  it("counts a same-day entry made after the count, not one made before", () => {
    const day = [{ date: "2026-09-26", amount: 10_000, group: "Feed", enteredAt: "2026-09-26T08:00:00Z" }, { date: "2026-09-26", amount: 2_000, group: "Other", enteredAt: "2026-09-26T15:00:00Z" }];
    expect(cashSince([], day, { date: "2026-09-26", enteredAt: "2026-09-26T12:00:00Z", actual: 50_000 }).moneyOut).toBe(2_000);
  });

  it("starts from what was counted", () => {
    expect(cashSince(inLines, outLines, { date: "2026-09-20", actual: 100_000 }).shouldBeOnHand).toBe(100_000 - 496_000);
    expect(cashSince([], [], null).shouldBeOnHand).toBe(0);
  });

  it("reports the difference found at a count", () => {
    expect(reconcileDifference(284_750, 1_000_000, 1_284_750)).toBe(0);
    expect(reconcileDifference(280_000, 1_000_000, 1_284_750)).toBe(-4_750);
  });
});
