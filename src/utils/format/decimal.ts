// Plain decimal with fixed places, e.g. FCR 1.72
export function decimal(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}
