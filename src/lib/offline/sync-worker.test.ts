// Sync worker against a stubbed /api/sync: sends, keeps everything on failure, pauses when signed out
import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetOfflineDbForTests } from "@/lib/offline/idb";
import { enqueue, listOutbox } from "@/lib/offline/outbox";
import { syncNow } from "@/lib/offline/sync-worker";

const user = "u1";
const entry = (clientId: string) => ({ type: "dailyLog.upsert" as const, clientId, userId: user, payload: { setId: "s4", date: "2026-09-26", deaths: 1 } });

type Body = { mutations: { mutationId: string }[] };
const reply = (fn: (body: Body) => unknown) =>
  vi.fn(async (_url: string, init: RequestInit) => Response.json(fn(JSON.parse(String(init.body)) as Body)));

beforeEach(() => {
  indexedDB = new IDBFactory();
  resetOfflineDbForTests();
});
afterEach(() => vi.unstubAllGlobals());

describe("syncNow", () => {
  it("sends waiting entries and marks them sent", async () => {
    await enqueue(entry("c1"));
    await enqueue(entry("c2"));
    const fetchMock = reply((b) => ({ results: b.mutations.map((m) => ({ mutationId: m.mutationId, status: "applied", id: "x", version: 1 })) }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await syncNow(user)).outcome).toBe("done");
    expect((await listOutbox(user)).map((i) => i.status)).toEqual(["sent", "sent"]);
    // One batch, then a heartbeat so the server knows nothing is waiting
    expect(JSON.parse(String(fetchMock.mock.calls[1]![1].body)).pending.count).toBe(0);
  });

  it("keeps entries when the network drops, to try later", async () => {
    await enqueue(entry("c1"));
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    expect((await syncNow(user)).outcome).toBe("offline");
    expect((await listOutbox(user))[0]).toMatchObject({ status: "pending", attempts: 1 });
  });

  it("keeps entries when signed out", async () => {
    await enqueue(entry("c1"));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 401 })));
    expect((await syncNow(user)).outcome).toBe("unauthorized");
    expect((await listOutbox(user))[0]!.status).toBe("pending");
  });

  it("treats the server's 'duplicate' after a lost reply as sent", async () => {
    await enqueue(entry("c1"));
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("reply lost"); }));
    await syncNow(user);
    vi.stubGlobal("fetch", reply((b) => ({ results: b.mutations.map((m) => ({ mutationId: m.mutationId, status: "duplicate", id: "log1", version: 1 })) })));
    // Pretend the retry time has come
    const [item] = await listOutbox(user);
    const { offlineDb } = await import("@/lib/offline/idb");
    await (await offlineDb()).put("outbox", { ...item!, nextAttemptAt: new Date(0).toISOString() });
    await syncNow(user);
    expect((await listOutbox(user))[0]).toMatchObject({ status: "sent", serverId: "log1" });
  });
});
