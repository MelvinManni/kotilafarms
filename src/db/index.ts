// Drizzle client over a pg pool; snake_case in the database, camelCase in code
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

export function createDb(url: string) {
  const pool = new Pool({ connectionString: url, max: 10 });
  return drizzle({ client: pool, schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
// Either the database or an open transaction
export type Executor = Db | Tx;
export { schema };
