// Sign-in, sign-out and password events for the activity log; a failure here never blocks signing in
import "server-only";
import { sql } from "drizzle-orm";
import type { Executor } from "@/db";
import { authEvents, type AuthEventKind } from "@/db/schema";

type AuthEvent = { kind: AuthEventKind; email: string; userId?: string | null; ip?: string | null };

export async function recordAuthEvent(db: Executor, e: AuthEvent) {
  const email = e.email.trim().toLowerCase();
  try {
    await db.insert(authEvents).values({
      kind: e.kind,
      email,
      ip: e.ip ?? null,
      // Unknown emails keep a null person
      userId: e.userId ?? sql`(select id from users where lower(email) = ${email} limit 1)`,
    });
  } catch (error) {
    console.error(`Could not record ${e.kind} for ${email}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
