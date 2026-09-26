// What the Feed page and Today say about stock and price
import type { FeedStockRow } from "@/types/feed";
import { addDays } from "@/utils/dates/add-days";
import { bags } from "@/utils/format/bags";
import { decimal } from "@/utils/format/decimal";
import { weekdayName } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import type { PriceTrend } from "@/utils/metrics/price-trend";

// Warn when a feed in use runs out within a week
export const RUN_OUT_WARN_DAYS = 7;
// Order this many days before the store is empty, for delivery
const ORDER_AHEAD_DAYS = 2;

const kindName = (r: FeedStockRow) => r.feed.split(" · ")[0]!;
const sets = (r: FeedStockRow) => r.eating.map((s) => `Set ${s.number}`).join(" and ");

// The feed that runs out soonest, if within the warning window
export function soonestRunOut(rows: FeedStockRow[]): FeedStockRow | null {
  const due = rows.filter((r) => r.daysLeft !== null && r.daysLeft <= RUN_OUT_WARN_DAYS).sort((a, b) => a.daysLeft! - b.daysLeft!);
  return due[0] ?? null;
}

export function runOutNotice(r: FeedStockRow, today: string): { title: string; body: string } {
  const days = Math.floor(r.daysLeft!);
  const title = days < 1 ? `${kindName(r)} runs out today` : `${kindName(r)} runs out in about ${days} ${days === 1 ? "day" : "days"}`;
  const orderBy = days - ORDER_AHEAD_DAYS;
  const order = orderBy <= 0 ? "Order today." : `Order by ${weekdayName(addDays(today, orderBy))} to be safe.`;
  return { title, body: `${bags(Math.max(0, r.stockBags))} left in the store, ${sets(r) || "the Sets"} ${r.eating.length > 1 ? "are" : "is"} using ${bags(r.bagsPerDay)} a day. ${order}` };
}

// "9 bags left, using 2.3 a day · Set 4" for Today's list
export const runOutDetail = (r: FeedStockRow) => `${bags(Math.max(0, r.stockBags))} left, using ${decimal(r.bagsPerDay, r.bagsPerDay % 1 ? 1 : 0)} a day${r.eating.length ? ` · ${sets(r)}` : ""}`;

export function priceHeadline(kind: string, t: PriceTrend): { title: string; note: string } {
  const month = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(`${t.first.date}T12:00:00Z`));
  const title = t.sinceFirst === 0 ? `${kind} is the same price as in ${month}` : `${kind} is ${naira(Math.abs(t.sinceFirst))} a bag ${t.sinceFirst > 0 ? "dearer" : "cheaper"} than in ${month}`;
  return { title, note: t.latestMoveBiggest ? "The latest rise was the biggest." : "" };
}
