// Before e2e: a fresh kotila_e2e database, migrated, with only the first owner and fixed lists
import { hash } from "@node-rs/argon2";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { createDb } from "@/db";
import { createFirstOwner } from "@/db/setup/create-first-owner";
import { insertReferenceData } from "@/db/setup/insert-reference-data";
import { E2E } from "./e2e-env";

export default async function globalSetup() {
  const admin = new URL(E2E.databaseUrl);
  admin.pathname = "/postgres";
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  await client.query('drop database if exists "kotila_e2e" with (force)');
  await client.query('create database "kotila_e2e"');
  await client.end();

  const migrator = drizzle({ connection: E2E.databaseUrl, casing: "snake_case" });
  await migrate(migrator, { migrationsFolder: "./src/db/migrations" });
  await migrator.$client.end();

  const db = createDb(E2E.databaseUrl);
  const owner = await createFirstOwner(db, { name: E2E.owner.name, email: E2E.owner.email, passwordHash: await hash(E2E.owner.password) });
  await insertReferenceData(db, owner.id);
  await db.$client.end();
}
