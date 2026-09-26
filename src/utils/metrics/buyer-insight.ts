// What a buyer's record says: birds and money, average price against the bulk rate, and what's still owed
import type { SaleRow } from "@/types/sale";
import { addDays } from "@/utils/dates/add-days";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";

export type BuyerInsight = {
  birds: number;
  sales: number;
  setNumbers: number[];
  total: number;
  paid: number;
  owed: number;
  averagePrice: number | null;
  since: string | null;
  oldestOwed: { date: string; days: number } | null;
  // Average − bulk rate (negative: they pay less)
  vsBulk: number | null;
  // What the gap came to on the last year's birds
  yearGap: number | null;
};

export function buyerInsight(sales: SaleRow[], bulkRate: number | null, today: string): BuyerInsight {
  const birds = sales.reduce((a, s) => a + s.birds, 0);
  const total = sales.reduce((a, s) => a + s.total, 0);
  const averagePrice = birds ? Math.round(total / birds) : null;
  const owing = sales.filter((s) => s.balance > 0).sort((a, b) => a.date.localeCompare(b.date));
  const vsBulk = averagePrice !== null && bulkRate ? averagePrice - bulkRate : null;
  const yearBirds = sales.filter((s) => s.date > addDays(today, -365)).reduce((a, s) => a + s.birds, 0);
  return {
    birds, sales: sales.length, setNumbers: [...new Set(sales.map((s) => s.set.number))].sort((a, b) => a - b),
    total, paid: sales.reduce((a, s) => a + s.paid, 0), owed: owing.reduce((a, s) => a + s.balance, 0), averagePrice,
    since: sales.map((s) => s.date).sort()[0] ?? null,
    oldestOwed: owing[0] ? { date: owing[0].date, days: owing[0].daysOwed } : null,
    vsBulk, yearGap: vsBulk !== null ? vsBulk * yearBirds : null,
  };
}

// Named when a buyer pays at least ₦100 a bird under the bulk rate
export const UNDER_BULK_NOTICE = 100;

export function underBulkNotice(name: string, b: BuyerInsight): { title: string; body: string } | null {
  if (b.vsBulk === null || b.vsBulk > -UNDER_BULK_NOTICE) return null;
  const gap = Math.round(-b.vsBulk / 10) * 10;
  return { title: `${name} pays about ${naira(gap)} a bird less than the bulk rate`, body: `On ${count(b.birds)} birds that is ${naira(-b.yearGap!)} over the year. Agree a price before the next sale.` };
}
