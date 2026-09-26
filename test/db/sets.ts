// Start a Set through the real service, for tests that need one
import type { Tx } from "@/db";
import { startSet } from "@/server/services/sets/start";
import type { SessionUser } from "@/types/session";
import { SET4 } from "@test/db/farm";

export async function makeSet(tx: Tx, by: SessionUser, over: Partial<typeof SET4> = {}) {
  const { set } = await startSet(tx, { clientId: crypto.randomUUID(), ...SET4, ...over }, by);
  return set;
}
