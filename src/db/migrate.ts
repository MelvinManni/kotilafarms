// `node db-migrate.cjs` inside the image: applies the committed migrations to DATABASE_URL (local Postgres or AWS RDS)
import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  if (existsSync(".env")) process.loadEnvFile(".env");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const pool = new Pool({ connectionString: url, max: 1 });
  // Same migrations table as `pnpm db:migrate` (drizzle-kit), so either can run against one database
  await migrate(drizzle({ client: pool }), { migrationsFolder: process.env.MIGRATIONS_DIR ?? "src/db/migrations" });
  await pool.end();
  console.log("Migrations are up to date.");
}

main().catch((error: unknown) => {
  // Drizzle wraps the real reason (e.g. a wrong password) in `cause`
  const cause = error instanceof Error && error.cause instanceof Error ? `\n${error.cause.message}` : "";
  console.error(error instanceof Error ? `${error.message}${cause}` : error);
  process.exit(1);
});
