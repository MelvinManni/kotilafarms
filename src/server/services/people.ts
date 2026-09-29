// Owners add a person or reset a password: the app makes the password, emails it, and the person must change it
import "server-only";
import { and, eq, sql } from "drizzle-orm";
import type { Executor } from "@/db";
import { users } from "@/db/schema";
import { env } from "@/lib/env";
import { recordCreate, recordNote } from "@/server/audit";
import { conflict, notFound, unprocessable } from "@/server/errors";
import { generatePassword } from "@/server/generate-password";
import { startingPasswordMail } from "@/server/mail/starting-password";
import { sendMail } from "@/server/mail/send-mail";
import { hashPassword } from "@/server/password";
import type { PersonCreateInput } from "@/schemas/auth";
import type { StartingPasswordResult } from "@/types/people";
import type { SessionUser } from "@/types/session";

const shown = { id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, lastActiveAt: users.lastActiveAt };

async function deliver(person: StartingPasswordResult["person"], password: string, actor: SessionUser, isReset: boolean): Promise<StartingPasswordResult> {
  const mail = await sendMail(startingPasswordMail({ ...person, password, addedBy: actor.name, isReset }));
  const e = env();
  return {
    person,
    emailed: mail.sent,
    password: mail.sent ? null : password,
    emailProblem: mail.sent ? null : mail.reason,
    signInUrl: new URL("/sign-in", e.NEXTAUTH_URL).toString(),
    videoUrl: e.HOW_TO_VIDEO_URL,
  };
}

export async function addPerson(db: Executor, input: PersonCreateInput, actor: SessionUser) {
  const password = generatePassword();
  const passwordHash = await hashPassword(password);
  const person = await db.transaction(async (tx) => {
    const [existing] = await tx.select({ name: users.name }).from(users).where(eq(sql`lower(${users.email})`, input.email.toLowerCase()));
    if (existing) throw conflict(`${existing.name} already has an account with that email. Open them and choose Reset password.`);
    const [row] = await tx.insert(users).values({ ...input, passwordHash, mustChangePassword: true, invitedBy: actor.id }).returning(shown);
    await recordCreate(tx, "users", row!.id, { userId: actor.id });
    return row!;
  });
  return deliver(person, password, actor, false);
}

export async function resetPassword(db: Executor, id: string, actor: SessionUser) {
  if (id === actor.id) throw unprocessable("Change your own password on your profile.");
  const password = generatePassword();
  const passwordHash = await hashPassword(password);
  const person = await db.transaction(async (tx) => {
    const [row] = await tx.update(users).set({ passwordHash, mustChangePassword: true }).where(and(eq(users.id, id), eq(users.active, true))).returning(shown);
    if (!row) throw notFound("That active person");
    await recordNote(tx, "users", id, "password", "Password reset; a new one was made by the app", { userId: actor.id });
    return row;
  });
  return deliver(person, password, actor, true);
}
