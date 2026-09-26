// Small rules for the entry screen: when it is read-only, and what was seen on recent days
import { tagLabel } from "@/constants/observation-tags";
import type { DailyLogRow } from "@/types/daily-log";
import type { SessionUser } from "@/types/session";
import { addDays } from "@/utils/dates/add-days";

// Recorders change only their own log, and only on its day (the server enforces this too)
export function lockedReason(user: SessionUser, existing: DailyLogRow | undefined, date: string, today: string): string | null {
  if (!existing || user.role !== "recorder") return null;
  if (existing.createdBy.id !== user.id) return `${existing.createdBy.name.split(" ")[0]} logged this day. Ask a manager to change it.`;
  if (date !== today) return "Only a manager can change a past day.";
  return null;
}

// "Wet litter logged Thu and Fri too." from the two days before
export function recentTagHint(logs: DailyLogRow[], date: string): string | undefined {
  const recent = [addDays(date, -2), addDays(date, -1)].map((d) => logs.find((l) => l.date === d)).filter((l): l is DailyLogRow => Boolean(l));
  const repeated = new Map<string, number>();
  for (const log of recent) for (const tag of log.tags) repeated.set(tag, (repeated.get(tag) ?? 0) + 1);
  const tags = [...repeated.entries()].filter(([, n]) => n === recent.length && n > 0).map(([t]) => tagLabel(t));
  return tags.length ? `${tags.join(" and ")} logged on the two days before too.` : undefined;
}
