// Route guards: who is signed in, and whether their role may do this
import "server-only";
import { getServerSession } from "next-auth";
import { connection } from "next/server";
import { authOptions } from "@/server/auth-options";
import { forbidden, unauthorized } from "@/server/errors";
import { passwordGate } from "@/server/password-gate";
import type { Role } from "@/types/role";
import type { SessionUser } from "@/types/session";

export async function getSessionUser(): Promise<SessionUser | null> {
  // Sessions are per request: never prerender a page that reads one
  await connection();
  const session = await getServerSession(authOptions());
  return session?.user?.id ? session.user : null;
}

// 401 when nobody is signed in (or they were deactivated); 403 until an app-made password is changed
export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw unauthorized();
  return passwordGate(user);
}

// 403 when the role isn't allowed
export function requireRole(user: SessionUser, roles: Role[]): SessionUser {
  if (!roles.includes(user.role)) throw forbidden();
  return user;
}
