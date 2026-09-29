// Look people up for sign-in and for the periodic role/active refresh
import "server-only";
import { eq, sql } from "drizzle-orm";
import { users } from "@/db/schema";
import type { Executor } from "@/db";
import { verifyPassword } from "@/server/password";
import type { SessionUser } from "@/types/session";

// The person, if the email and password match an active account
export async function checkCredentials(db: Executor, email: string, password: string): Promise<SessionUser | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.email})`, email.trim().toLowerCase()));
  if (!user || !user.active) return null;
  if (!(await verifyPassword(user.passwordHash, password))) return null;
  await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, user.id));
  return { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword };
}

export async function currentStatus(db: Executor, id: string) {
  const [user] = await db.select({ role: users.role, active: users.active, name: users.name, mustChangePassword: users.mustChangePassword }).from(users).where(eq(users.id, id));
  return user ?? null;
}
