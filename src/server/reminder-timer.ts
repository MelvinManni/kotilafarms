// Checks every 5 minutes whether the 6pm missing-log email is due; started once per server when email is set up
import "server-only";
import { env } from "@/lib/env";
import { getDb } from "@/server/db";
import { runDailyReminder } from "@/server/services/reminders/daily-reminder";

const EVERY_MS = 5 * 60 * 1000;
const started = globalThis as { kotilaReminderTimer?: NodeJS.Timeout };

export function startReminderTimer() {
  if (started.kotilaReminderTimer) return;
  if (!env().RESEND_API_KEY) return console.log("Daily reminders are off: RESEND_API_KEY is not set.");
  const tick = () =>
    runDailyReminder(getDb())
      .then((outcome) => {
        if (outcome === "sent") console.log("Sent the 6pm missing-log reminder to the owners.");
        if (outcome === "failed") console.error("The 6pm missing-log reminder didn't send; trying again in 5 minutes.");
      })
      .catch((error: unknown) => console.error(`The 6pm reminder check failed: ${error instanceof Error ? error.message : String(error)}`));
  started.kotilaReminderTimer = setInterval(tick, EVERY_MS);
  started.kotilaReminderTimer.unref();
  void tick();
  console.log(`Daily reminders are on: owners get an email at 18:00 ${env().FARM_TIMEZONE} when a running Set has no log.`);
}
