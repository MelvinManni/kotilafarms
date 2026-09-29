// `node db-migrate.cjs` inside the image: applies the committed migrations to DATABASE_URL (local Postgres or AWS RDS)
import { existsSync } from "node:fs";
import { describeDbError, runMigrations } from "@/db/run-migrations";

async function main() {
  if (existsSync(".env")) process.loadEnvFile(".env");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  await runMigrations(url, process.env.MIGRATIONS_DIR ?? "src/db/migrations");
}

main().catch((error: unknown) => {
  console.error(describeDbError(error));
  process.exit(1);
});
