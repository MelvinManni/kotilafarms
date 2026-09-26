// Outbox rules on a real (fake) IndexedDB: one item per entry, ordering, stuck sends, nothing lost
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { resetOfflineDbForTests } from "@/lib/offline/idb";
import { applyResults, backOff, enqueue, listOutbox, markSending, pruneSent, readyToSend, removeItem, resetStuck } from "@/lib/offline/outbox";

const user = "u1";
const log = (clientId: string, deaths: number, extra: Record<string, unknown> = {}) => ({ type: "dailyLog.upsert" as const, clientId, userId: user, payload: { setId: "s4", date: "2026-09-26", deaths, ...extra } });

beforeEach(() => {
  indexedDB = new IDBFactory();
  resetOfflineDbForTests();
});

describe("outbox", () => {
  it("changes a pending entry in place instead of adding a second one", async () => {
    const a = await enqueue(log("c1", 2));
    const b = await enqueue(log("c1", 3));
    expect(b.mutationId).toBe(a.mutationId);
    const items = await listOutbox(user);
    expect(items).toHaveLength(1);
    expect(items[0]!.payload.deaths).toBe(3);
  });

  it("queues a new change once the first has started sending, and holds it until the first is sent", async () => {
    const a = await enqueue(log("c1", 2));
    await markSending([a.mutationId]);
    const b = await enqueue(log("c1", 3, { baseVersion: 1 }));
    expect(b.mutationId).not.toBe(a.mutationId);
    expect(await readyToSend(user)).toHaveLength(0);
    await applyResults([{ mutationId: a.mutationId, status: "applied", id: "log1", version: 1 }]);
    expect((await readyToSend(user)).map((i) => i.mutationId)).toEqual([b.mutationId]);
  });

  it("sends a stuck entry again after two minutes (the server drops the repeat)", async () => {
    const a = await enqueue(log("c1", 2), 0);
    await markSending([a.mutationId], 0);
    await resetStuck(60_000);
    expect(await readyToSend(user, 60_000)).toHaveLength(0);
    await resetStuck(3 * 60_000);
    expect((await readyToSend(user, 3 * 60_000)).map((i) => i.mutationId)).toEqual([a.mutationId]);
  });

  it("keeps a turned-down entry until the person removes it", async () => {
    const a = await enqueue(log("c1", -1));
    await applyResults([{ mutationId: a.mutationId, status: "rejected", error: { code: "validation", message: "Deaths can't be below 0." } }]);
    await pruneSent(Date.now() + 30 * 24 * 60 * 60_000);
    expect((await listOutbox(user))[0]).toMatchObject({ status: "rejected", error: { message: "Deaths can't be below 0." } });
    await removeItem(a.mutationId);
    expect(await listOutbox(user)).toHaveLength(0);
  });

  it("backs off after a failed send and keeps the entry", async () => {
    const a = await enqueue(log("c1", 2), 0);
    await backOff([a.mutationId], 0);
    expect(await readyToSend(user, 1_000)).toHaveLength(0);
    expect(await readyToSend(user, 60_000)).toHaveLength(1);
    expect((await listOutbox(user))[0]!.attempts).toBe(1);
  });

  it("only sends this person's entries", async () => {
    await enqueue(log("c1", 2));
    await enqueue({ ...log("c2", 1), userId: "someone-else" });
    expect(await readyToSend(user)).toHaveLength(1);
  });
});
