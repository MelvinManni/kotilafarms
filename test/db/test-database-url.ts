// Where the test database lives: TEST_DATABASE_URL, or a local DATABASE_URL with the name kotila_test
import { existsSync } from "node:fs";

export function testDatabaseUrl(): string {
  if (existsSync(".env")) process.loadEnvFile(".env");
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const url = new URL(process.env.DATABASE_URL ?? "postgres://kotila:kotila@localhost:5432/kotila");
  // The tests drop and recreate their database: never borrow a remote server from DATABASE_URL
  if (!["localhost", "127.0.0.1", "db"].includes(url.hostname)) {
    throw new Error(`DATABASE_URL points at ${url.hostname}. Set TEST_DATABASE_URL to a local database for the tests.`);
  }
  url.pathname = "/kotila_test";
  return url.toString();
}
