// Weight from integer grams: 1030 → "1.03 kg"
export function kg(grams: number | null | undefined, digits = 2): string {
  if (grams === null || grams === undefined || Number.isNaN(grams)) return "—";
  return `${(grams / 1000).toFixed(digits)} kg`;
}
