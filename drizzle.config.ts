// drizzle-kit: schema in src/db/schema, migrations committed in src/db/migrations
import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  casing: "snake_case",
  strict: true,
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
