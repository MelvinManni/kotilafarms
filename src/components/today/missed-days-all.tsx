// Missed days across running Sets, grouped per Set
import { MissedDays } from "@/components/daily-log/missed-days";
import type { TodayPayload } from "@/types/today";

export function MissedDaysAll({ missed }: { missed: TodayPayload["missed"] }) {
  const bySet = new Map<string, { number: number; days: string[] }>();
  for (const m of missed) {
    const entry = bySet.get(m.setId) ?? { number: m.setNumber, days: [] };
    entry.days.push(m.date);
    bySet.set(m.setId, entry);
  }
  return (
    <>
      {[...bySet.entries()].map(([setId, { number, days }]) => (
        <MissedDays key={setId} setId={setId} setNumber={number} days={[...days].sort()} limit={1} />
      ))}
    </>
  );
}
