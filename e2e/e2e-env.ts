// Settings the e2e app runs with: its own database and a fixed first owner
import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile(".env");

function databaseUrl(): string {
  const base = new URL(process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "postgres://kotila:kotila@localhost:5432/kotila");
  // e2e drops and recreates its database: never borrow a remote server from DATABASE_URL
  if (!process.env.TEST_DATABASE_URL && !["localhost", "127.0.0.1", "db"].includes(base.hostname)) {
    throw new Error(`DATABASE_URL points at ${base.hostname}. Set TEST_DATABASE_URL to a local database for e2e.`);
  }
  base.pathname = "/kotila_e2e";
  return base.toString();
}

export const E2E_PORT = 3200;

export const E2E = {
  databaseUrl: databaseUrl(),
  baseUrl: `http://localhost:${E2E_PORT}`,
  owner: { name: "Kosi", email: "kosi@e2e.test", password: "e2e-owner-password" },
  manager: { name: "Adaeze Nwankwo", email: "adaeze@e2e.test", password: "e2e-manager-password" },
  recorder: { name: "Chinedu Okafor", email: "chinedu@e2e.test", password: "e2e-recorder-password" },
};

export const E2E_APP_ENV = {
  DATABASE_URL: E2E.databaseUrl,
  NEXTAUTH_URL: E2E.baseUrl,
  NEXTAUTH_SECRET: "e2e-secret-that-is-at-least-32-characters-long",
  S3_BUCKET: "kotila-e2e",
  S3_REGION: "eu-west-1",
  FARM_TIMEZONE: "Africa/Lagos",
};
