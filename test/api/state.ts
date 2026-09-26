// Who is "signed in" and which transaction getDb() returns, for route tests
import type { Tx } from "@/db";
import type { SessionUser } from "@/types/session";

// Farm "today" in route tests is fixed to the design date unless a test changes it
export const apiState: { tx: Tx | null; user: SessionUser | null; today: string } = { tx: null, user: null, today: "2026-09-26" };

export function signInAs(user: SessionUser | null) {
  apiState.user = user;
}
