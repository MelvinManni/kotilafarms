// Runs once when the server starts: fail fast on bad env, set up the database in the container, start the 6pm reminder
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { env } = await import("@/lib/env");
  env();
  const { dbOnStart } = await import("@/server/db-on-start");
  await dbOnStart();
  const { startReminderTimer } = await import("@/server/reminder-timer");
  startReminderTimer();
}
