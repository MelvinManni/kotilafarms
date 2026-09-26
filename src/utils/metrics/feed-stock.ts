// Stock and run-out for one feed type, from purchases and the daily log's feed used
import { addDays } from "@/utils/dates/add-days";
import { averageDailyUse, daysOfFeedLeft, feedStockBags } from "@/utils/metrics/feed";

type Use = { date: string; setId: string; qty: number; unit: "bags" | "kg" };

export type FeedStock = { boughtBags: number; usedBags: number; stockBags: number; bagsPerDay: number; daysLeft: number | null; eatingSetIds: string[] };

// Bags from a log entry, turning kg into bags with this feed's bag size
export const toBags = (u: Pick<Use, "qty" | "unit">, kgPerBag: number) => (u.unit === "kg" ? u.qty / kgPerBag : u.qty);

// Kilograms from a log entry
export const toKg = (u: Pick<Use, "qty" | "unit">, kgPerBag: number) => (u.unit === "kg" ? u.qty : u.qty * kgPerBag);

// Daily rate = average bags a day over the days with feed logged in the last 7 days
export function feedStock(boughtBags: number[], uses: Use[], kgPerBag: number, today: string): FeedStock {
  const bought = boughtBags.reduce((a, b) => a + b, 0);
  const used = uses.reduce((a, u) => a + toBags(u, kgPerBag), 0);
  const weekStart = addDays(today, -6);
  const recent = uses.filter((u) => u.date >= weekStart && u.date <= today);
  const perDay = new Map<string, number>();
  for (const u of recent) perDay.set(u.date, (perDay.get(u.date) ?? 0) + toBags(u, kgPerBag));
  const bagsPerDay = Math.round(averageDailyUse([...perDay.values()]) * 10) / 10;
  const stockBags = feedStockBags(bought, used);
  return { boughtBags: bought, usedBags: Math.round(used * 100) / 100, stockBags, bagsPerDay, daysLeft: daysOfFeedLeft(stockBags, bagsPerDay), eatingSetIds: [...new Set(recent.map((u) => u.setId))] };
}
