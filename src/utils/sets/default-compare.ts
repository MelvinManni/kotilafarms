// Start the comparison with the three latest closed Sets, else the two latest Sets
import type { SetSummary } from "@/types/sets";

export function defaultCompare(sets: SetSummary[]): string[] {
  const latest = [...sets].sort((a, b) => b.number - a.number);
  const closed = latest.filter((s) => s.status === "closed").slice(0, 3);
  return (closed.length >= 2 ? closed : latest.slice(0, 2)).map((s) => s.id).reverse();
}
