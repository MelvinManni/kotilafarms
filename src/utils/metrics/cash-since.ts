// Cash since the last reconciliation: what came in and went out (grouped), and what should be on hand
import { cashPosition } from "@/utils/metrics/money";

// enteredAt (ISO) settles lines on the same day as a count
export type CashLine = { date: string; amount: number; group: string; enteredAt?: string };

export type CashSince = {
  opening: number;
  moneyIn: number;
  moneyOut: number;
  shouldBeOnHand: number;
  inByGroup: { label: string; value: number }[];
  outByGroup: { label: string; value: number }[];
};

const grouped = (lines: CashLine[]) => {
  const map = new Map<string, number>();
  for (const l of lines) map.set(l.group, (map.get(l.group) ?? 0) + l.amount);
  return [...map].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};

// A line counts if dated after the count, or on its day but entered after it
export function cashSince(moneyIn: CashLine[], moneyOut: CashLine[], last: { date: string; enteredAt?: string; actual: number } | null): CashSince {
  const after = (l: CashLine) => !last || l.date > last.date || (l.date === last.date && Boolean(l.enteredAt && last.enteredAt && l.enteredAt > last.enteredAt));
  const ins = moneyIn.filter(after).filter((l) => l.amount !== 0);
  const outs = moneyOut.filter(after).filter((l) => l.amount !== 0);
  const opening = last?.actual ?? 0;
  const p = cashPosition(opening, ins.map((l) => l.amount), outs.map((l) => l.amount));
  return { opening, ...p, inByGroup: grouped(ins), outByGroup: grouped(outs) };
}

// Counted cash + bank against what the books say; positive means more on hand than expected
export function reconcileDifference(countedCash: number, bankBalance: number, expected: number): number {
  return countedCash + bankBalance - expected;
}
