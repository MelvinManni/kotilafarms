// Where a Set's vaccine stands: given (on time or late), late, due today or tomorrow, or upcoming
import { addDays } from "@/utils/dates/add-days";
import { daysBetween } from "@/utils/dates/days-between";

export type VaccineState = "given" | "given-late" | "late" | "due-today" | "due-tomorrow" | "upcoming";

export type VaccineStatus = { dueOn: string; state: VaccineState; daysLate: number; givenDay: number | null };

export function vaccineStatus(v: { dueAgeDays: number; givenOn: string | null }, startDate: string, today: string): VaccineStatus {
  const dueOn = addDays(startDate, v.dueAgeDays);
  if (v.givenOn) {
    const late = Math.max(0, daysBetween(dueOn, v.givenOn));
    return { dueOn, state: late > 0 ? "given-late" : "given", daysLate: late, givenDay: daysBetween(startDate, v.givenOn) };
  }
  if (dueOn < today) return { dueOn, state: "late", daysLate: daysBetween(dueOn, today), givenDay: null };
  return { dueOn, state: dueOn === today ? "due-today" : dueOn === addDays(today, 1) ? "due-tomorrow" : "upcoming", daysLate: 0, givenDay: null };
}

const ORDINAL = ["", "1st", "2nd", "3rd", "4th", "5th"];
export const doseLabel = (n: number) => `${ORDINAL[n] ?? `${n}th`} dose`;

// Tag text for the schedule table
export function vaccineStateLabel(s: VaccineStatus): string {
  const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;
  return { given: "Given", "given-late": `Given ${days(s.daysLate)} late`, late: `${days(s.daysLate)} late`, "due-today": "Due today", "due-tomorrow": "Due tomorrow", upcoming: "Upcoming" }[s.state];
}
