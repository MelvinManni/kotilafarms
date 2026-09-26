// Make people for tests, returned as the session user the app would see
import { randomUUID } from "node:crypto";
import type { Tx } from "@/db";
import { users } from "@/db/schema";
import type { Role } from "@/types/role";
import type { SessionUser } from "@/types/session";

export async function makePerson(tx: Tx, role: Role, name = `Test ${role}`): Promise<SessionUser> {
  const email = `${role}-${randomUUID()}@example.com`;
  const [row] = await tx.insert(users).values({ name, email, role, passwordHash: "x" }).returning();
  return { id: row!.id, name: row!.name, email: row!.email, role: row!.role };
}
