// Change your own password: check the current one, save the new one, lift the first-password gate
import "server-only";
import { eq } from "drizzle-orm";
import type { Executor } from "@/db";
import { users } from "@/db/schema";
import { recordAuthEvent } from "@/server/auth-events";
import { ApiError, notFound, unprocessable } from "@/server/errors";
import { hashPassword, verifyPassword } from "@/server/password";
import { allowAttempt, clearAttempts } from "@/server/rate-limit";
import type { PasswordChangeInput } from "@/schemas/auth";

export async function changePassword(db: Executor, userId: string, input: PasswordChangeInput) {
  const key = `password|${userId}`;
  if (!allowAttempt(key)) throw new ApiError(429, "rate_limited", "Too many tries. Wait 15 minutes and try again.");
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || !user.active) throw notFound("Your account");
  if (!(await verifyPassword(user.passwordHash, input.current))) {
    throw unprocessable("That isn't your current password.", [{ path: "current", message: "That isn't your current password." }]);
  }
  await db.update(users).set({ passwordHash: await hashPassword(input.password), mustChangePassword: false }).where(eq(users.id, userId));
  clearAttempts(key);
  await recordAuthEvent(db, { kind: "password_changed", email: user.email, userId });
  return { ok: true as const };
}
