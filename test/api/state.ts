// Who is "signed in" and which transaction getDb() returns, for route tests
import type { Tx } from "@/db";
import type { SessionUser } from "@/types/session";

export const apiState: { tx: Tx | null; user: SessionUser | null } = { tx: null, user: null };

export function signInAs(user: SessionUser | null) {
  apiState.user = user;
}
