// Route guards: who is signed in, and whether their role may do this
import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { forbidden, unauthorized } from "@/server/errors";
import type { Role } from "@/types/role";
import type { SessionUser } from "@/types/session";

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions());
  return session?.user?.id ? session.user : null;
}

// 401 when nobody is signed in (or they were deactivated)
export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw unauthorized();
  return user;
}

// 403 when the role isn't allowed
export function requireRole(user: SessionUser, roles: Role[]): SessionUser {
  if (!roles.includes(user.role)) throw forbidden();
  return user;
}
