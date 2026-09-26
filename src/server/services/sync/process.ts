// Process a batch from one device, in order, each in its own transaction with its ledger row (docs/07-offline-sync.md)
import "server-only";
import { eq } from "drizzle-orm";
import type { Db, Executor } from "@/db";
import { syncMutations } from "@/db/schema";
import type { SyncMutation, SyncRequest, SyncResult } from "@/schemas/sync";
import { applyMutation } from "@/server/services/sync/apply";
import { rejectionOf } from "@/server/services/sync/classify";
import { recordHeartbeat } from "@/server/services/sync/devices";
import { payloadHash } from "@/server/services/sync/payload-hash";
import type { SessionUser } from "@/types/session";

const isUniqueViolation = (e: unknown) => (e as { cause?: { code?: string } }).cause?.code === "23505" || (e as { code?: string }).code === "23505";

// A mutation already in the ledger: the same one again is a duplicate; a different payload under the same id is refused
async function fromLedger(db: Executor, m: SyncMutation, hash: string): Promise<SyncResult | null> {
  const [prev] = await db.select().from(syncMutations).where(eq(syncMutations.mutationId, m.mutationId));
  if (!prev) return null;
  if (prev.payloadHash !== hash) return { mutationId: m.mutationId, status: "rejected", error: { code: "MUTATION_ID_REUSED", message: "This entry id was already used for something else." } };
  const stored = prev.result as Omit<SyncResult, "mutationId">;
  return { ...stored, mutationId: m.mutationId, status: prev.status === "applied" ? "duplicate" : stored.status };
}

async function processOne(db: Db | Executor, m: SyncMutation, user: SessionUser, today: string, deviceId: string): Promise<SyncResult> {
  const hash = payloadHash({ type: m.type, clientId: m.clientId, payload: m.payload });
  if (m.userId !== user.id) return { mutationId: m.mutationId, status: "rejected", error: { code: "WRONG_USER", message: "This entry belongs to someone else on this phone." } };
  const known = await fromLedger(db, m, hash);
  if (known) return known;
  try {
    return await db.transaction(async (tx) => {
      let result: Omit<SyncResult, "mutationId">;
      try {
        // A savepoint, so a refused entry doesn't spoil the ledger write
        result = await tx.transaction((sp) => applyMutation(sp, m, user, today, deviceId));
      } catch (error) {
        const rejection = rejectionOf(error);
        if (!rejection) throw error;
        result = { status: "rejected", error: rejection };
      }
      const status = result.status === "duplicate" ? "applied" : (result.status as "applied" | "conflict" | "rejected");
      await tx.insert(syncMutations).values({ mutationId: m.mutationId, deviceId, userId: user.id, type: m.type, payloadHash: hash, status, entityTable: m.type.split(".")[0] ?? null, entityId: result.id ?? null, result });
      return { ...result, mutationId: m.mutationId };
    });
  } catch (error) {
    // Two copies of the same request raced: the other one won, so this one is a duplicate
    if (isUniqueViolation(error)) {
      const known2 = await fromLedger(db, m, hash);
      if (known2) return known2;
    }
    console.error(error);
    return { mutationId: m.mutationId, status: "retry", error: { code: "server_error", message: "The server couldn't save this yet. It will try again." } };
  }
}

export async function processSync(db: Db | Executor, req: SyncRequest, user: SessionUser, today: string): Promise<SyncResult[]> {
  await recordHeartbeat(db, req, user.id);
  const results: SyncResult[] = [];
  for (const m of req.mutations) results.push(await processOne(db, m, user, today, req.deviceId));
  return results;
}
