// Percent from a ratio: 0.036 → "3.6%"; signed shows + or −
import { MINUS } from "@/utils/format/count";

export function pct(
  ratio: number | null | undefined,
  digits = 1,
  options?: { signed?: boolean },
): string {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return "—";
  const value = ratio * 100;
  const text = Math.abs(value).toFixed(digits);
  const isZero = Number(text) === 0;
  if (value < 0 && !isZero) return `${MINUS}${text}%`;
  if (options?.signed && value > 0 && !isZero) return `+${text}%`;
  return `${text}%`;
}
