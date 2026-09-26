// Outbox: every offline-capable write is saved here first, then sent by the sync worker
import type { SyncResult } from "@/schemas/sync";
import { nextAttemptAt } from "@/lib/offline/backoff";
import { offlineDb } from "@/lib/offline/idb";
import { outboxChanged } from "@/lib/offline/outbox-events";
import type { OutboxItem } from "@/lib/offline/outbox-types";

const STUCK_MS = 2 * 60_000;

let counter = 0;
const nextOrder = (now: number) => now * 1000 + (counter++ % 1000);
const KEEP_SENT_MS = 7 * 24 * 60 * 60_000;

type NewEntry = Pick<OutboxItem, "type" | "clientId" | "payload" | "userId"> & { enteredOfflineAt?: string };

// A create that hasn't left the phone is changed in place: same mutationId, so it can only ever arrive once
export async function enqueue(entry: NewEntry, now = Date.now()): Promise<OutboxItem> {
  const db = await offlineDb();
  const same = await db.getAllFromIndex("outbox", "byClient", entry.clientId);
  const waiting = same.find((i) => i.status === "pending" && i.type === entry.type);
  const item: OutboxItem = waiting
    ? { ...waiting, payload: entry.payload, enteredOfflineAt: entry.enteredOfflineAt ?? waiting.enteredOfflineAt, error: undefined }
    : { ...entry, mutationId: crypto.randomUUID(), createdAt: new Date(now).toISOString(), order: nextOrder(now), status: "pending", attempts: 0, nextAttemptAt: new Date(now).toISOString() };
  await db.put("outbox", item);
  outboxChanged();
  return item;
}

export async function listOutbox(userId?: string): Promise<OutboxItem[]> {
  const db = await offlineDb();
  const items = userId ? await db.getAllFromIndex("outbox", "byUser", userId) : await db.getAll("outbox");
  return items.sort((a, b) => a.order - b.order);
}

// Due to send, oldest first; an entry waits while an earlier change to the same record hasn't gone
export async function readyToSend(userId: string, now = Date.now(), limit = 25): Promise<OutboxItem[]> {
  const items = await listOutbox(userId);
  const ready: OutboxItem[] = [];
  const blocked = new Set<string>();
  for (const item of items) {
    if (item.status === "sent") continue;
    const due = item.status === "pending" && Date.parse(item.nextAttemptAt) <= now;
    if (due && !blocked.has(item.clientId)) ready.push(item);
    blocked.add(item.clientId);
  }
  return ready.slice(0, limit);
}

async function update(mutationIds: string[], change: (item: OutboxItem) => OutboxItem) {
  const db = await offlineDb();
  const tx = db.transaction("outbox", "readwrite");
  for (const id of mutationIds) {
    const item = await tx.store.get(id);
    if (item) await tx.store.put(change(item));
  }
  await tx.done;
  outboxChanged();
}

export const markSending = (ids: string[], now = Date.now()) => update(ids, (i) => ({ ...i, status: "sending", sendingSince: new Date(now).toISOString() }));

// Network trouble or a server hiccup: back to pending, later
export const backOff = (ids: string[], now = Date.now()) =>
  update(ids, (i) => ({ ...i, status: "pending", sendingSince: undefined, attempts: i.attempts + 1, nextAttemptAt: nextAttemptAt(i.attempts, now) }));

export async function applyResults(results: SyncResult[], now = Date.now()) {
  const byId = new Map(results.map((r) => [r.mutationId, r]));
  await update([...byId.keys()], (i) => {
    const r = byId.get(i.mutationId)!;
    if (r.status === "applied" || r.status === "duplicate") return { ...i, status: "sent", sentAt: new Date(now).toISOString(), serverId: r.id, sendingSince: undefined, error: undefined };
    if (r.status === "conflict") return { ...i, status: "conflict", conflictId: r.conflictId, sendingSince: undefined };
    if (r.status === "rejected") return { ...i, status: "rejected", error: r.error, sendingSince: undefined };
    return { ...i, status: "pending", sendingSince: undefined, attempts: i.attempts + 1, nextAttemptAt: nextAttemptAt(i.attempts, now), error: r.error };
  });
}

// A send that never finished (tab closed, crash): safe to send again, the server's ledger drops repeats
export async function resetStuck(now = Date.now()) {
  const stuck = (await listOutbox()).filter((i) => i.status === "sending" && now - Date.parse(i.sendingSince ?? i.createdAt) > STUCK_MS);
  if (stuck.length) await update(stuck.map((i) => i.mutationId), (i) => ({ ...i, status: "pending", sendingSince: undefined }));
}

// Only the person, on purpose, removes an entry that was turned down or that clashed
export async function removeItem(mutationId: string) {
  await (await offlineDb()).delete("outbox", mutationId);
  outboxChanged();
}

export async function pruneSent(now = Date.now()) {
  const old = (await listOutbox()).filter((i) => i.status === "sent" && now - Date.parse(i.sentAt ?? i.createdAt) > KEEP_SENT_MS);
  const db = await offlineDb();
  for (const i of old) await db.delete("outbox", i.mutationId);
}

// What the phone tells the server is still waiting here (for "on Chinedu's phone")
export function pendingSummary(items: OutboxItem[]) {
  return items
    .filter((i) => i.status === "pending" || i.status === "sending")
    .map((i) => ({ type: i.type, setId: (i.payload.setId as string | null | undefined) ?? null, date: i.payload.date as string | undefined }));
}
