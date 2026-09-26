// People with access: list them, change a role, deactivate or reactivate (owners only; audited)
import "server-only";
import { and, asc, count, eq, ne } from "drizzle-orm";
import type { Executor } from "@/db";
import { users } from "@/db/schema";
import { recordChange } from "@/server/audit";
import { notFound, unprocessable } from "@/server/errors";
import type { UserUpdateInput } from "@/schemas/auth";
import type { SessionUser } from "@/types/session";

export async function listUsers(db: Executor) {
  return db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, lastActiveAt: users.lastActiveAt })
    .from(users)
    .orderBy(asc(users.createdAt));
}

export type UserListItem = Awaited<ReturnType<typeof listUsers>>[number];

export async function updateUser(db: Executor, id: string, input: UserUpdateInput, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(users).where(eq(users.id, id));
    if (!before) throw notFound("That person");
    if (id === actor.id && input.active === false) throw unprocessable("You can't deactivate yourself.");
    const losingOwner = before.role === "owner" && before.active && (input.active === false || (input.role && input.role !== "owner"));
    if (losingOwner) {
      const [others] = await tx.select({ n: count() }).from(users).where(and(eq(users.role, "owner"), eq(users.active, true), ne(users.id, id)));
      if (others!.n === 0) throw unprocessable("The farm needs at least one active owner.");
    }
    const [after] = await tx.update(users).set(input).where(eq(users.id, id)).returning();
    await recordChange(tx, { table: "users", rowId: id, before: { role: before.role, active: before.active }, after: input, userId: actor.id });
    return { id: after!.id, name: after!.name, email: after!.email, role: after!.role, active: after!.active, lastActiveAt: after!.lastActiveAt };
  });
}
