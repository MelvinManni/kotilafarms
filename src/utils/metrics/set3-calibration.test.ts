// Set 3, the last completed cycle: the spec's calibration numbers must come out exactly
import { describe, expect, it } from "vitest";
import { liveBirds, mortalityRate } from "@/utils/metrics/birds";
import { feedConversionRatio, liveWeightKg } from "@/utils/metrics/feed";
import { saleBalance } from "@/utils/metrics/money";
import { setPnl } from "@/utils/metrics/set-pnl";

// From docs/12-seed-data.md (test fixture, never loaded into the database)
const EXPENSES = {
  feed: 2_066_412,
  day_olds: 445_000,
  drugs: 131_600,
  brooding: 96_500,
  transport: 84_000,
  litter: 36_000,
  labour: 90_000,
  processing: 22_500,
  other: 22_788,
};
const SALES = [
  { buyer: "Mama Nkechi", birds: 30, total: 225_000, deposit: 0, paidAtSale: 10_000 },
  { buyer: "Chidi Poultry Mart", birds: 20, total: 153_400, deposit: 0, paidAtSale: 10_000 },
  { buyer: "Alhaji Sule", birds: 50, total: 358_550, deposit: 0, paidAtSale: 304_950 },
  { buyer: "Other buyers", birds: 365, total: 2_810_700, deposit: 0, paidAtSale: 2_810_700 },
];
const sold = SALES.reduce((n, s) => n + s.birds, 0);
const birdRevenue = SALES.reduce((n, s) => n + s.total, 0);
const pnl = setPnl({ intake: 500, birdsSold: sold, birdRevenue, manureRevenue: 15_900, expensesByCategory: EXPENSES });

describe("Set 3 calibration", () => {
  it("sold 465 of 500 with 35 deaths: 7.0% mortality, none left", () => {
    expect(sold).toBe(465);
    expect(mortalityRate(35, 500)).toBe(0.07);
    expect(liveBirds(500, 35, sold)).toBe(0);
  });

  it("spent ₦2,994,800, took ₦3,563,550, made ₦568,750 at 15.96%", () => {
    expect(pnl.expenses).toBe(2_994_800);
    expect(pnl.revenue).toBe(3_563_550);
    expect(pnl.profit).toBe(568_750);
    expect(pnl.margin).toBeCloseTo(0.1596, 4);
  });

  it("cost ₦6,440 and earned ₦7,629 per bird sold", () => {
    expect(pnl.costPerBirdSold).toBe(6_440);
    expect(pnl.revenuePerBird).toBe(7_629);
    expect(pnl.marginPerBird).toBe(1_189);
    expect(pnl.costPerBirdStarted).toBe(5_990);
  });

  it("feed was 69% of the cost base", () => {
    expect(Math.round((EXPENSES.feed / pnl.expenses) * 100)).toBe(69);
  });

  it("FCR 1.74 at a 2.46 kg sale weight", () => {
    const live = liveWeightKg(sold, 2_460);
    expect(feedConversionRatio(1.74 * live, live)).toBeCloseTo(1.74, 2);
  });

  it("three buyers owe ₦412,000", () => {
    const owed = SALES.map((s) => saleBalance(s, [])).filter((b) => b > 0);
    expect(owed).toEqual([215_000, 143_400, 53_600]);
    expect(owed.reduce((a, b) => a + b, 0)).toBe(412_000);
  });
});
