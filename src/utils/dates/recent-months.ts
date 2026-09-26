// The last n months as "YYYY-MM" with labels like "September 2026", newest first
const NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function recentMonths(today: string, n = 12): { value: string; label: string }[] {
  let [y, m] = today.split("-").map(Number) as [number, number];
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ value: `${y}-${String(m).padStart(2, "0")}`, label: `${NAMES[m - 1]} ${y}` });
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return out;
}

export const monthName = (month: string) => NAMES[Number(month.slice(5, 7)) - 1]!;
