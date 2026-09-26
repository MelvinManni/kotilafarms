// Sets an expense on this day can belong to: running then, or closed after it (backdating)
import type { SetSummary } from "@/types/sets";

export function attributionSets(sets: SetSummary[], date: string) {
  return sets
    .filter((s) => s.startDate <= date && (!s.closedOn || s.closedOn >= date))
    .map((s) => ({ id: s.id, label: `Set ${s.number}`, meta: s.status === "closed" ? `Closed ${s.closedOn}` : `${s.status[0]!.toUpperCase()}${s.status.slice(1)} · day ${s.dayOfAge}` }));
}
