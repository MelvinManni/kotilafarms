// What the Health page leads with: the most pressing vaccine, and the treatments total
import type { HealthRecordRow, SetVaccineRow } from "@/types/health";
import { count } from "@/utils/format/count";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

const URGENCY = { late: 0, "due-today": 1, "due-tomorrow": 2 } as const;

type Due = { setId: string; setNumber: number; liveBirds: number; vaccine: SetVaccineRow };

// Late first, then due today, then tomorrow
export function mostPressingVaccine(due: Due[]): Due | null {
  const pressing = due.filter((d) => d.vaccine.state in URGENCY).sort((a, b) => URGENCY[a.vaccine.state as keyof typeof URGENCY] - URGENCY[b.vaccine.state as keyof typeof URGENCY] || a.vaccine.dueAgeDays - b.vaccine.dueAgeDays);
  return pressing[0] ?? null;
}

export function vaccineNotice({ setNumber, liveBirds, vaccine: v }: Due): { title: string; body: string } {
  const when = v.state === "late" ? `is ${v.daysLate} ${v.daysLate === 1 ? "day" : "days"} late` : v.state === "due-today" ? "is due today" : "is due tomorrow";
  return { title: `${v.item} ${when} for Set ${setNumber}`, body: `Day ${v.dueAgeDays} · ${count(liveBirds)} doses · give in ${v.method.toLowerCase()} in the morning` };
}

// "Sets 4 and 5 · ₦43,800 since 12 Sep"
export function treatmentsSummary(rows: HealthRecordRow[]): string {
  if (rows.length === 0) return "Nothing recorded yet";
  const numbers = [...new Set(rows.map((r) => r.set.number))].sort((a, b) => a - b);
  const sets = numbers.length === 1 ? `Set ${numbers[0]}` : `Sets ${numbers.slice(0, -1).join(", ")} and ${numbers.at(-1)}`;
  const total = rows.reduce((a, r) => a + (r.cost ?? 0), 0);
  const since = rows.map((r) => r.date).sort()[0]!;
  return `${sets} · ${naira(total)} since ${shortDate(since, false)}`;
}
