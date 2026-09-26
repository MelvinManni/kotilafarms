// Days that should have a log but don't: day 1 up to yesterday, or up to the closing day
import { addDays } from "@/utils/dates/add-days";

export function missingDays(startDate: string, closedOn: string | null, today: string, logged: string[]): string[] {
  const have = new Set(logged);
  const last = closedOn && closedOn < today ? closedOn : addDays(today, -1);
  const out: string[] = [];
  for (let day = addDays(startDate, 1); day <= last; day = addDays(day, 1)) if (!have.has(day)) out.push(day);
  return out;
}

// Deaths above this count look worse than usual (yesterday or the Set's daily average, whichever is higher)
export function deathsAlertAbove(yesterday: number | null, total: number, days: number): number {
  const average = days > 0 ? Math.ceil(total / days) : 0;
  return Math.max(yesterday ?? 0, average);
}
