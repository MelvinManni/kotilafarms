// Naira amount: ₦1,284,750, −₦879,550 for money out, +₦ with sign
import { count, MINUS } from "@/utils/format/count";

export function naira(n: number | null | undefined, options?: { sign?: boolean }): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const rounded = Math.round(n);
  const amount = `₦${count(Math.abs(rounded))}`;
  if (rounded < 0) return `${MINUS}${amount}`;
  if (options?.sign && rounded > 0) return `+${amount}`;
  return amount;
}
