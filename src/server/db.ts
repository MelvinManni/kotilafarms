// The app's database connection, made on first use and reused (also across dev reloads)
import "server-only";
import { createDb, type Db } from "@/db";
import { env } from "@/lib/env";

const cache = globalThis as unknown as { kotilaDb?: Db };

export function getDb(): Db {
  cache.kotilaDb ??= createDb(env().DATABASE_URL);
  return cache.kotilaDb;
}
