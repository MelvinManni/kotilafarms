// Daily log rules: which days can be logged, who may edit, when a reason is needed
import "server-only";
import type { dailyLogs, sets } from "@/db/schema";
import { forbidden, unprocessable } from "@/server/errors";
import type { SessionUser } from "@/types/session";

type SetRow = typeof sets.$inferSelect;
type LogRow = typeof dailyLogs.$inferSelect;

// A log's day must fall between the Set's start and today (or its closing day)
export function assertLoggableDay(set: SetRow, date: string, today: string) {
  if (date < set.startDate) throw unprocessable(`Set ${set.number} started on ${set.startDate}. Choose a day from then on.`);
  if (date > today) throw unprocessable("You can't log a day that hasn't happened yet.");
  if (set.closedOn && date > set.closedOn) throw unprocessable(`Set ${set.number} closed on ${set.closedOn}.`);
}

// Recorders may change only their own log, and only on the same day
export function assertCanEdit(actor: SessionUser, log: LogRow, today: string) {
  if (actor.role !== "recorder") return;
  if (log.createdBy !== actor.id || log.date !== today) throw forbidden();
}

// Changing a count after the day needs a reason, kept in the edit history
export function assertReasonIfLate(before: LogRow, after: Partial<LogRow>, today: string, reason?: string) {
  if (before.date >= today) return;
  const countChanged =
    (after.deaths !== undefined && after.deaths !== before.deaths) || (after.feedQty !== undefined && after.feedQty !== before.feedQty);
  if (countChanged && !reason?.trim()) throw unprocessable("Say why you're changing this after the day.");
}
