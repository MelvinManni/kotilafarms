// Make the first owner when nobody exists yet; returns their id (or the oldest owner's)
import { asc, eq } from "drizzle-orm";
import type { Executor } from "@/db";
import { users } from "@/db/schema";

export type FirstOwner = { name: string; email: string; passwordHash: string };

export async function createFirstOwner(db: Executor, owner: FirstOwner): Promise<{ id: string; created: boolean }> {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.role, "owner")).orderBy(asc(users.createdAt)).limit(1);
  if (existing) return { id: existing.id, created: false };
  const [row] = await db
    .insert(users)
    .values({ name: owner.name, email: owner.email.toLowerCase(), passwordHash: owner.passwordHash, role: "owner" })
    .returning({ id: users.id });
  return { id: row!.id, created: true };
}
