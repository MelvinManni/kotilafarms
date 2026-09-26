// Test database helpers: every test runs in a transaction that is always rolled back
import { inject } from "vitest";
import { createDb, type Db, type Tx } from "@/db";

let db: Db | undefined;

export function testDb(): Db {
  db ??= createDb(inject("testDatabaseUrl"));
  return db;
}

class Rollback extends Error {}

// Run fn inside a transaction, then undo everything it wrote
export async function inRollback(fn: (tx: Tx) => Promise<void>): Promise<void> {
  try {
    await testDb().transaction(async (tx) => {
      await fn(tx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}

// The Postgres constraint a failed query broke (Drizzle wraps the driver error)
function brokenConstraint(error: unknown): string | undefined {
  const e = error as { constraint?: string; cause?: { constraint?: string } };
  return e.cause?.constraint ?? e.constraint;
}

// Expect the write to fail on this constraint; a savepoint keeps the outer transaction usable
export async function expectConstraint(tx: Tx, constraint: string, write: (sp: Tx) => Promise<unknown>) {
  let broke: string | undefined;
  try {
    await tx.transaction(async (sp) => {
      await write(sp);
    });
  } catch (error) {
    broke = brokenConstraint(error);
    if (!broke) throw error;
  }
  if (broke !== constraint) throw new Error(`Expected constraint "${constraint}" to fail, got ${broke ?? "no error"}`);
}
