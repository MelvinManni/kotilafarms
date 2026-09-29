// Apply the committed migrations to a database (local Postgres or AWS RDS)
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

export async function runMigrations(url: string, migrationsFolder: string) {
  // Give up fast when the database can't be reached, so the log shows why
  const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 15_000 });
  console.log(`Connecting to ${new URL(url).host}…`);
  try {
    // Same migrations table as `pnpm db:migrate` (drizzle-kit), so either can run against one database
    await migrate(drizzle({ client: pool }), { migrationsFolder });
  } finally {
    await pool.end();
  }
  console.log("Migrations are up to date.");
}
