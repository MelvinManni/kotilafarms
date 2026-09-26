// Quick picks for the P&L: the latest Sets one by one, and every closed Set together
import type { SetSummary } from "@/types/sets";

export function pnlChoices(sets: SetSummary[]): { value: string; label: string; ids: string[] }[] {
  const latest = [...sets].sort((a, b) => b.number - a.number);
  const closed = latest.filter((s) => s.status === "closed");
  const picks = latest.slice(0, 4).map((s) => ({ value: s.id, label: `Set ${s.number}`, ids: [s.id] }));
  if (closed.length > 1) {
    const nums = closed.map((s) => s.number).sort((a, b) => a - b);
    picks.push({ value: "closed", label: `All closed (${nums.length})`, ids: closed.map((s) => s.id) });
  }
  return picks;
}

// The latest closed Set, or the latest Set when none has closed
export const defaultPnlChoice = (sets: SetSummary[]) => [...sets].sort((a, b) => b.number - a.number).find((s) => s.status === "closed")?.id ?? [...sets].sort((a, b) => b.number - a.number)[0]?.id;
