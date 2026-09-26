// The farm week (Sunday to Saturday) that a day falls in
import { addDays } from "@/utils/dates/add-days";

export function weekOf(day: string): { start: string; end: string } {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  const start = addDays(day, -weekday);
  return { start, end: addDays(start, 6) };
}
