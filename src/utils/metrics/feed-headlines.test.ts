// Feed warnings and price headline in the farm's words
import { describe, expect, it } from "vitest";
import type { FeedStockRow } from "@/types/feed";
import { priceHeadline, runOutDetail, runOutNotice, soonestRunOut } from "@/utils/metrics/feed-headlines";
import { priceTrend } from "@/utils/metrics/price-trend";
import { storeSummary } from "@/utils/metrics/feed-store";

const row = (over: Partial<FeedStockRow>): FeedStockRow => ({ feedTypeId: "f", feed: "Finisher · Ultima", kind: "finisher", stockBags: 9, bagsPerDay: 2.3, daysLeft: 9 / 2.3, eating: [{ id: "s4", number: 4 }], lastPrice: 24_800, ...over });

describe("feed headlines", () => {
  it("warns about the feed that runs out first, within a week", () => {
    const starter = row({ feed: "Starter · Breedwell", stockBags: 14, bagsPerDay: 1.3, daysLeft: 14 / 1.3 });
    expect(soonestRunOut([starter, row({})])?.feed).toBe("Finisher · Ultima");
    expect(soonestRunOut([starter])).toBeNull();
  });

  it("says when to order (Sat 26 Sep: about 3 days left → order by Sunday)", () => {
    expect(runOutNotice(row({}), "2026-09-26")).toEqual({ title: "Finisher runs out in about 3 days", body: "9 bags left in the store, Set 4 is using 2.3 bags a day. Order by Sunday to be safe." });
    expect(runOutNotice(row({ stockBags: 2, daysLeft: 0.8 }), "2026-09-26").title).toBe("Finisher runs out today");
    expect(runOutDetail(row({}))).toBe("9 bags left, using 2.3 a day · Set 4");
  });

  it("states the price change since the first of the recent purchases", () => {
    const t = priceTrend([{ date: "2026-06-06", pricePerBag: 21_500 }, { date: "2026-09-02", pricePerBag: 23_800 }, { date: "2026-09-22", pricePerBag: 24_800 }])!;
    expect(priceHeadline("Finisher", t).title).toBe("Finisher is ₦3,300 a bag dearer than in June");
  });

  it("sums the store and counts Sets eating", () => {
    const starter = row({ feedTypeId: "s", stockBags: 14, eating: [{ id: "s5", number: 5 }] });
    expect(storeSummary([row({}), starter, row({ feedTypeId: "g", stockBags: -1, eating: [] })])).toBe("23 bags in the store · 2 Sets eating");
    expect(storeSummary([])).toBe("0 bags in the store · no Sets eating");
  });
});
