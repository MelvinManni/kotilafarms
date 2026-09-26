// Whole-number count with thousands separators: 1284 → "1,284"
export function count(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const rounded = Math.round(n);
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return rounded < 0 ? `${MINUS}${digits}` : digits;
}

// True minus sign for negative figures
export const MINUS = "−";
