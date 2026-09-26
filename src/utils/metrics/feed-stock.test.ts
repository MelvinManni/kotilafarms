// Feed stock, daily use and price trend (design: Feed screen, finisher ₦23,800 → ₦24,800)
import { describe, expect, it } from "vitest";
import { feedStock } from "@/utils/metrics/feed-stock";
import { linkedAmountsAgree } from "@/utils/metrics/linked-amounts-agree";
import { latestRises, priceTrend } from "@/utils/metrics/price-trend";

describe("feedStock", () => {
  it("counts kg logs as part bags and averages over the days fed this week", () => {
    const uses = [
      { date: "2026-09-10", setId: "s4", qty: 5, unit: "bags" as const },
      { date: "2026-09-25", setId: "s4", qty: 50, unit: "kg" as const },
      { date: "2026-09-26", setId: "s4", qty: 2, unit: "bags" as const },
      { date: "2026-09-26", setId: "s5", qty: 1, unit: "bags" as const },
    ];
    const s = feedStock([20], uses, 25, "2026-09-26");
    expect(s).toMatchObject({ boughtBags: 20, usedBags: 10, stockBags: 10, bagsPerDay: 2.5, eatingSetIds: ["s4", "s5"] });
    expect(s.daysLeft).toBe(4);
  });

  it("has no run-out day when nothing is being eaten", () => {
    expect(feedStock([14], [], 25, "2026-09-26").daysLeft).toBeNull();
  });
});

describe("priceTrend", () => {
  const prices = [["2026-06-06", 21_500], ["2026-07-01", 22_000], ["2026-07-28", 22_800], ["2026-08-14", 23_200], ["2026-09-02", 23_800], ["2026-09-22", 24_800]].map(([date, p]) => ({ date: date as string, pricePerBag: p as number }));

  it("calls out the latest move and the change since the first of the last six", () => {
    expect(priceTrend(prices)).toMatchObject({ lastMove: 1_000, sinceFirst: 3_300, latestMoveBiggest: true, first: { date: "2026-06-06" } });
  });

  it("has nothing to say with no purchases", () => {
    expect(priceTrend([])).toBeNull();
  });
});

describe("linkedAmountsAgree", () => {
  it("allows a price rounded from the total, refuses a wrong total", () => {
    expect(linkedAmountsAgree(3, 24_833, 74_500)).toBe(true);
    expect(linkedAmountsAgree(20, 24_800, 400_000)).toBe(false);
  });
});

describe("latestRises", () => {
  it("marks each feed's latest purchase only when it cost more than the one before", () => {
    const newestFirst = [
      { id: "f3", feedTypeId: "fin", pricePerBag: 24_800 },
      { id: "s2", feedTypeId: "sta", pricePerBag: 26_000 },
      { id: "f2", feedTypeId: "fin", pricePerBag: 23_800 },
      { id: "s1", feedTypeId: "sta", pricePerBag: 26_200 },
      { id: "f1", feedTypeId: "fin", pricePerBag: 25_000 },
    ];
    expect([...latestRises(newestFirst)]).toEqual(["f3"]);
  });
});
