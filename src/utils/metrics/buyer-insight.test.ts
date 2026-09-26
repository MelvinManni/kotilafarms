// Alhaji Sule (design: Buyer): 110 birds, ₦7,210 a bird against a ₦7,500 bulk rate, ₦53,600 owed
import { describe, expect, it } from "vitest";
import type { SaleRow } from "@/types/sale";
import { buyerInsight, underBulkNotice } from "@/utils/metrics/buyer-insight";

const sale = (date: string, setNumber: number, birds: number, total: number, paid: number, daysOwed = 0): SaleRow => ({
  kind: "birds", id: date, clientId: date, version: 1, date, set: { id: String(setNumber), number: setNumber, closedOn: null }, buyer: { id: "b", name: "Alhaji Sule" },
  birds, pricePerBird: Math.round(total / birds), total, deposit: 0, paidAtSale: paid, payments: [], paid, balance: total - paid, daysOwed, belowBulk: true, method: "cash", note: null, createdBy: "Kosi",
});
const SULE = [sale("2026-09-10", 3, 50, 358_550, 304_950, 16), sale("2026-09-03", 3, 30, 216_000, 216_000), sale("2026-06-28", 2, 30, 218_550, 218_550)];

describe("buyerInsight", () => {
  it("sums the record and compares with the bulk rate", () => {
    const b = buyerInsight(SULE, 7_500, "2026-09-26");
    expect(b).toMatchObject({ birds: 110, sales: 3, setNumbers: [2, 3], total: 793_100, paid: 739_500, owed: 53_600, averagePrice: 7_210, since: "2026-06-28", oldestOwed: { date: "2026-09-10", days: 16 }, vsBulk: -290, yearGap: -31_900 });
    expect(underBulkNotice("Alhaji Sule", b)).toEqual({ title: "Alhaji Sule pays about ₦290 a bird less than the bulk rate", body: "On 110 birds that is ₦31,900 over the year. Agree a price before the next sale." });
  });

  it("says nothing for a buyer at or near the bulk rate, or with no bulk rate set", () => {
    expect(underBulkNotice("Chidi", buyerInsight([sale("2026-09-18", 3, 20, 153_400, 10_000)], 7_500, "2026-09-26"))).toBeNull();
    expect(buyerInsight(SULE, null, "2026-09-26").vsBulk).toBeNull();
  });
});
