// Where the test database lives: TEST_DATABASE_URL, or DATABASE_URL with the name kotila_test
import { existsSync } from "node:fs";

export function testDatabaseUrl(): string {
  if (existsSync(".env")) process.loadEnvFile(".env");
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const url = new URL(process.env.DATABASE_URL ?? "postgres://kotila:kotila@localhost:5432/kotila");
  url.pathname = "/kotila_test";
  return url.toString();
}
