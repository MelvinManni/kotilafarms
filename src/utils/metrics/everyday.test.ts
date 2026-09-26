// Everyday numbers: live birds, feed stock and run-out, cash position, capital
import { describe, expect, it } from "vitest";
import { liveBirds, mortalityRate } from "@/utils/metrics/birds";
import { averageDailyUse, daysOfFeedLeft, feedCostPerKgLiveWeight, feedStockBags } from "@/utils/metrics/feed";
import { capitalPosition, cashPosition, ownershipShare, saleBalance } from "@/utils/metrics/money";
import { combinePnlInputs, setPnl } from "@/utils/metrics/set-pnl";
import { uniformity } from "@/utils/metrics/weight-sample";

describe("everyday metrics", () => {
  it("Set 4: 482 live of 500 with 18 deaths (3.6%)", () => {
    expect(liveBirds(500, 18, 0)).toBe(482);
    expect(mortalityRate(18, 500)).toBeCloseTo(0.036);
  });

  it("finisher: 9 bags at 2.3 a day lasts about 4 days", () => {
    expect(feedStockBags(66, 57)).toBe(9);
    expect(Math.floor(daysOfFeedLeft(9, averageDailyUse([2.2, 2.3, 2.4]))!)).toBe(3);
    expect(daysOfFeedLeft(9, 0)).toBeNull();
  });

  it("feed cost per kg live weight rounds to whole naira", () => {
    expect(feedCostPerKgLiveWeight(2_066_412, 1_143.9)).toBe(1_806);
  });

  it("cash since 1 Sep: in ₦2,164,300, out ₦879,550, should be ₦1,284,750", () => {
    expect(cashPosition(0, [2_164_300], [879_550])).toEqual({ moneyIn: 2_164_300, moneyOut: 879_550, shouldBeOnHand: 1_284_750 });
  });

  it("partner capital: Kosi net ₦1,750,000 and 63.39% of shares", () => {
    expect(capitalPosition([1_900_000, -150_000])).toEqual({ contributed: 1_900_000, withdrawn: 150_000, net: 1_750_000 });
    expect(ownershipShare(633_858, 1_000_000)).toBeCloseTo(0.6339, 4);
  });

  it("a sale balance goes down with each payment", () => {
    expect(saleBalance({ total: 225_000, deposit: 0, paidAtSale: 10_000 }, [50_000, 15_000])).toBe(150_000);
  });

  it("adds several Sets into one P&L", () => {
    const a = { intake: 200, birdsSold: 181, birdRevenue: 1_283_000, manureRevenue: 6_200, expensesByCategory: { feed: 700_000, other: 496_300 } };
    const b = { intake: 300, birdsSold: 281, birdRevenue: 2_070_000, manureRevenue: 9_400, expensesByCategory: { feed: 1_000_000, other: 712_400 } };
    const pnl = setPnl(combinePnlInputs([a, b]));
    expect(pnl.revenue).toBe(3_368_600);
    expect(pnl.expenses).toBe(2_908_700);
    expect(pnl.expensesByCategory.feed).toBe(1_700_000);
  });

  it("gives NaN, not a crash, for empty inputs", () => {
    expect(mortalityRate(0, 0)).toBeNaN();
    expect(uniformity([])).toBeNaN();
  });
});
