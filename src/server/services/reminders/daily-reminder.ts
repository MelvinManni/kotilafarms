// The 6pm missing-log email: once a farm day, claimed in the database so no two servers or minutes send it twice
import "server-only";
import { and, eq } from "drizzle-orm";
import type { Executor } from "@/db";
import { reminderRuns, users } from "@/db/schema";
import { env } from "@/lib/env";
import { dailyReminderMail } from "@/server/mail/daily-reminder";
import { sendMail } from "@/server/mail/send-mail";
import { setsMissingLog } from "@/server/services/reminders/missing-logs";
import { todayInZone } from "@/utils/dates/today-in-zone";

export const REMINDER_HOUR = 18;
const KIND = "missing_logs";

export type ReminderOutcome = "too_early" | "already_done" | "all_logged" | "sent" | "failed";

const hourIn = (timeZone: string, now: Date) => Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "numeric", hourCycle: "h23" }).format(now));

export async function runDailyReminder(db: Executor, now = new Date()): Promise<ReminderOutcome> {
  const { FARM_TIMEZONE, NEXTAUTH_URL } = env();
  if (hourIn(FARM_TIMEZONE, now) < REMINDER_HOUR) return "too_early";
  const day = todayInZone(FARM_TIMEZONE, now);
  // The insert is the claim: only one caller gets the row
  const [claim] = await db.insert(reminderRuns).values({ kind: KIND, day }).onConflictDoNothing().returning({ id: reminderRuns.id });
  if (!claim) return "already_done";
  const missing = await setsMissingLog(db, day);
  if (!missing.length) return "all_logged";
  const owners = await db.select({ email: users.email }).from(users).where(and(eq(users.role, "owner"), eq(users.active, true)));
  const to = owners.map((o) => o.email);
  const mail = await sendMail(dailyReminderMail(to, missing, day, NEXTAUTH_URL));
  if (!mail.sent) {
    // Let the next check try again
    await db.delete(reminderRuns).where(eq(reminderRuns.id, claim.id));
    return "failed";
  }
  await db.update(reminderRuns).set({ sentAt: new Date(), sets: missing.map((s) => s.number), recipients: to }).where(eq(reminderRuns.id, claim.id));
  return "sent";
}
