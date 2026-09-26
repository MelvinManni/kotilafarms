// Send the outbox to /api/sync: one runner across tabs, batches of 25, back off on trouble (docs/07-offline-sync.md)
import { MAX_BATCH, type SyncResult } from "@/schemas/sync";
import { deviceId } from "@/lib/offline/device-id";
import { writeMeta } from "@/lib/offline/idb";
import { applyResults, backOff, listOutbox, markSending, pendingSummary, pruneSent, readyToSend, resetStuck } from "@/lib/offline/outbox";
import type { OutboxItem } from "@/lib/offline/outbox-types";

export type SyncOutcome = "done" | "offline" | "unauthorized" | "busy";

let running = false;

async function post(userId: string, batch: OutboxItem[]) {
  const all = await listOutbox(userId);
  return fetch("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      deviceId: await deviceId(),
      userAgent: navigator.userAgent.slice(0, 300),
      pending: { count: pendingSummary(all).length, summary: pendingSummary(all).slice(0, 50) },
      mutations: batch.map((i) => ({ mutationId: i.mutationId, clientId: i.clientId, type: i.type, payload: i.payload, userId: i.userId, enteredOfflineAt: i.enteredOfflineAt })),
    }),
  });
}

// `force`: send everything waiting now, ignoring the backoff (the person pressed Send now)
async function run(userId: string, results: SyncResult[], force: boolean): Promise<SyncOutcome> {
  await resetStuck();
  await pruneSent();
  let sent = false;
  for (let round = 0; round < 8; round++) {
    const batch = await readyToSend(userId, force ? Number.MAX_SAFE_INTEGER : Date.now(), MAX_BATCH);
    if (!batch.length) break;
    const ids = batch.map((i) => i.mutationId);
    await markSending(ids);
    let res: Response;
    try {
      res = await post(userId, batch);
    } catch {
      await backOff(ids);
      return "offline";
    }
    if (res.status === 401) {
      // Signed out on this device: keep everything, send after the next sign-in
      await backOff(ids, Date.now() - 60 * 60_000);
      return "unauthorized";
    }
    if (!res.ok) {
      await backOff(ids);
      return "done";
    }
    const body = (await res.json()) as { results: SyncResult[] };
    await applyResults(body.results);
    results.push(...body.results);
    sent = true;
  }
  // Tell the server what is still waiting here now, so Today stops saying it's on this phone
  if (sent) await post(userId, []).catch(() => undefined);
  await writeMeta("lastSyncedAt", new Date().toISOString());
  return "done";
}

export async function syncNow(userId: string, { force = false } = {}): Promise<{ outcome: SyncOutcome; results: SyncResult[] }> {
  const results: SyncResult[] = [];
  const job = async () => ({ outcome: await run(userId, results, force), results });
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("kotila-sync", { ifAvailable: true }, async (lock) => (lock ? job() : { outcome: "busy" as const, results }));
  }
  if (running) return { outcome: "busy", results };
  running = true;
  try {
    return await job();
  } finally {
    running = false;
  }
}
