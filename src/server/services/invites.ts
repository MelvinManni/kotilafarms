// Invites: an owner adds someone (or resets a password); the person sets their password from the link
import "server-only";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type { Executor } from "@/db";
import { invites, users } from "@/db/schema";
import { conflict, notFound, unprocessable } from "@/server/errors";
import { recordCreate, recordNote } from "@/server/audit";
import { hashPassword } from "@/server/password";
import { hashToken, newToken } from "@/server/tokens";
import type { InviteAcceptInput, InviteCreateInput } from "@/schemas/auth";
import type { SessionUser } from "@/types/session";

const INVITE_DAYS = 7;

const byEmail = (db: Executor, email: string) =>
  db.select().from(users).where(eq(sql`lower(${users.email})`, email.toLowerCase())).then((r) => r[0]);

export async function createInvite(db: Executor, input: InviteCreateInput, actor: SessionUser) {
  const existing = await byEmail(db, input.email);
  if (existing && !existing.active) throw conflict(`${existing.name} is deactivated. Reactivate them first.`);
  const token = newToken();
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(invites).values({ ...input, tokenHash: hashToken(token), expiresAt, createdBy: actor.id });
  return { token, path: `/invite/${token}`, expiresAt, isReset: Boolean(existing) };
}

async function openInvite(db: Executor, token: string) {
  const [row] = await db
    .select({ invite: invites, invitedBy: users.name })
    .from(invites)
    .innerJoin(users, eq(users.id, invites.createdBy))
    .where(and(eq(invites.tokenHash, hashToken(token)), isNull(invites.acceptedAt), gt(invites.expiresAt, new Date())));
  return row;
}

// What the invite page shows; null when the link is used, expired or wrong
export async function describeInvite(db: Executor, token: string) {
  const row = await openInvite(db, token);
  if (!row) return null;
  const existing = await byEmail(db, row.invite.email);
  return { name: row.invite.name, email: row.invite.email, role: row.invite.role, invitedBy: row.invitedBy, isReset: Boolean(existing) };
}

export async function acceptInvite(db: Executor, input: InviteAcceptInput) {
  const row = await openInvite(db, input.token);
  if (!row) throw notFound("That invite");
  const passwordHash = await hashPassword(input.password);
  return db.transaction(async (tx) => {
    const existing = await byEmail(tx, row.invite.email);
    if (existing && !existing.active) throw unprocessable("This account is deactivated. Ask an owner.");
    const [user] = existing
      ? await tx.update(users).set({ passwordHash }).where(eq(users.id, existing.id)).returning()
      : await tx
          .insert(users)
          .values({ name: row.invite.name, email: row.invite.email, role: row.invite.role, passwordHash, invitedBy: row.invite.createdBy })
          .returning();
    await tx.update(invites).set({ acceptedAt: new Date() }).where(eq(invites.id, row.invite.id));
    // The person accepting the link is the one acting
    if (existing) await recordNote(tx, "users", user!.id, "password", "Set a new password from a reset link", { userId: user!.id });
    else await recordCreate(tx, "users", user!.id, { userId: user!.id });
    return { email: user!.email };
  });
}
