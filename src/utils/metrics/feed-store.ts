// "23 bags in the store · 2 Sets eating" across every feed
import type { FeedStockRow } from "@/types/feed";
import { bags } from "@/utils/format/bags";

export function storeSummary(rows: FeedStockRow[]): string {
  const total = rows.reduce((a, r) => a + Math.max(0, r.stockBags), 0);
  const eating = new Set(rows.flatMap((r) => r.eating.map((s) => s.id))).size;
  return `${bags(total)} in the store · ${eating === 0 ? "no Sets eating" : `${eating} ${eating === 1 ? "Set" : "Sets"} eating`}`;
}
