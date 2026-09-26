// Finance headlines in the farm's words (design: Finance)
import { describe, expect, it } from "vitest";
import type { CashPayload, PnlPayload } from "@/types/finance";
import { cashHeadline, pnlHeadline } from "@/utils/metrics/finance-headlines";
import { setPnl } from "@/utils/metrics/set-pnl";

const pnl = (sets: PnlPayload["sets"], profitOffset = 0): PnlPayload => {
  const p = setPnl({ intake: 500, birdsSold: 465, birdRevenue: 3_547_650, manureRevenue: 15_900, expensesByCategory: { Feed: 2_994_800 + profitOffset } });
  return { sets, intake: 500, birdsSold: 465, birdRevenue: 3_547_650, manureRevenue: 15_900, pnl: p, byCategory: [], feedShare: 1 };
};

describe("finance headlines", () => {
  it("states cash on hand since the last count", () => {
    const c = { since: { id: "r", date: "2026-09-01", countedCash: 0, bankBalance: 0, expected: 0, difference: 0, note: null, by: "Kosi Obi" }, firstRecord: "2026-07-20", opening: 0, moneyIn: 2_164_300, moneyOut: 879_550, shouldBeOnHand: 1_284_750, inRows: [], outRows: [], owed: { total: 0, buyers: 0 } } satisfies CashPayload;
    expect(cashHeadline(c)).toEqual({ title: "₦1,284,750 should be on hand", subtitle: "Money in minus money out since Kosi reconciled on 1 Sep." });
  });

  it("states what a Set made, and a loss plainly", () => {
    expect(pnlHeadline(pnl([{ id: "3", number: 3, startDate: "2026-07-20", closedOn: "2026-09-14", status: "closed" }]))).toEqual({ title: "Set 3 made ₦568,750 — a 15.96% margin", subtitle: "500 day-olds, 465 sold · closed 14 September 2026" });
    const three = [1, 2, 3].map((n) => ({ id: String(n), number: n, startDate: "2026-01-01", closedOn: "2026-01-01", status: "closed" }));
    expect(pnlHeadline(pnl(three)).title).toMatch(/^Sets 1–3 made/);
    expect(pnlHeadline(pnl([{ id: "5", number: 5, startDate: "2026-09-20", closedOn: null, status: "brooding" }], 1_000_000)).title).toBe("Set 5 is ₦431,250 down so far");
  });
});
