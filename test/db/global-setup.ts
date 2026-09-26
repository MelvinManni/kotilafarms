// Before the db tests: make a fresh kotila_test database and run every committed migration on it
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import type { TestProject } from "vitest/node";
import { testDatabaseUrl } from "./test-database-url";

declare module "vitest" {
  interface ProvidedContext {
    testDatabaseUrl: string;
  }
}

export default async function setup(project: TestProject) {
  const url = testDatabaseUrl();
  const name = new URL(url).pathname.slice(1);
  const admin = new URL(url);
  admin.pathname = "/postgres";
  const client = new Client({ connectionString: admin.toString() });
  try {
    await client.connect();
  } catch (error) {
    throw new Error(`Can't reach Postgres for the db tests (${admin.host}). Start it with: docker compose up -d db\n${String(error)}`);
  }
  await client.query(`drop database if exists "${name}" with (force)`);
  await client.query(`create database "${name}"`);
  await client.end();

  const db = drizzle({ connection: url, casing: "snake_case" });
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await db.$client.end();
  project.provide("testDatabaseUrl", url);
}
