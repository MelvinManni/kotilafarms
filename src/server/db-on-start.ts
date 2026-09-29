// On server start in the container: create or update the tables, then the first owner
import { describeDbError } from "@/db/describe-db-error";
import { runMigrations } from "@/db/run-migrations";
import { runSetup } from "@/db/setup/run-setup";
import { parseSetupEnv } from "@/db/setup/setup-env";

export async function dbOnStart() {
  if (process.env.DB_SETUP_ON_START !== "true") return;
  const url = process.env.DATABASE_URL;
  if (!url) return console.error("Database setup skipped: DATABASE_URL is not set.");
  try {
    await runMigrations(url, process.env.MIGRATIONS_DIR ?? "src/db/migrations");
    // Setup needs FIRST_OWNER_*; once an owner exists they can be removed
    if (process.env.FIRST_OWNER_EMAIL) await runSetup(parseSetupEnv(process.env));
    else console.log("FIRST_OWNER_EMAIL is not set: skipping first-owner setup.");
  } catch (error) {
    // Keep serving so health checks pass; the log says what to fix
    console.error(`Database setup failed: ${describeDbError(error)}`);
  }
}
