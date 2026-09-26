// "Set 3 · 465 birds sold for ₦3,547,650" for the latest Set with sales
import type { SaleRow } from "@/types/sale";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";

export function salesHeadline(sales: SaleRow[]): string | null {
  const latest = sales[0];
  if (!latest) return null;
  const mine = sales.filter((s) => s.set.id === latest.set.id);
  const birds = mine.reduce((n, s) => n + s.birds, 0);
  const total = mine.reduce((n, s) => n + s.total, 0);
  return `Set ${latest.set.number}${latest.set.closedOn ? ` closed ${latest.set.closedOn}` : ""} · ${count(birds)} birds sold for ${naira(total)}`;
}
