// Bag counts: "1 bag", "9 bags", "2.3 bags"
import { decimal } from "@/utils/format/decimal";

export function bags(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return `${decimal(rounded, rounded % 1 ? 1 : 0)} ${Math.abs(rounded) === 1 ? "bag" : "bags"}`;
}
