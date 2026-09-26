// Expenses API end to end: Set or overhead, duplicates, capital items, late changes, removal, receipts
import { describe, expect, it, vi } from "vitest";
import { DELETE, PATCH } from "@/app/api/expenses/[id]/route";
import { GET, POST } from "@/app/api/expenses/route";
import { GET as categories } from "@/app/api/expense-categories/route";
import { POST as upload } from "@/app/api/uploads/receipt/route";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

const stored: string[] = [];
vi.mock("@/server/storage/receipts", async (original) => ({
  ...(await original<typeof import("@/server/storage/receipts")>()),
  putReceipt: async (key: string) => void stored.push(key),
}));

async function farm(tx: Parameters<Parameters<typeof withApi>[0]>[0]) {
  const people = await readyFarm(tx);
  const set = await makeSet(tx, people.owner);
  signInAs(people.manager);
  const cats = (await call(categories)).body as { id: string; key: string }[];
  const cat = (key: string) => cats.find((c) => c.key === key)!.id;
  const body = (over: Record<string, unknown> = {}) => ({ clientId: crypto.randomUUID(), date: "2026-09-25", categoryId: cat("litter"), description: "12 bags of sawdust", amount: 18_500, setId: set.id, overhead: false, ...over });
  return { ...people, set, cat, body };
}

describe("expenses API", () => {
  it("adds a Set expense once, however often it is sent", async () => {
    await withApi(async (tx) => {
      const { body, set } = await farm(tx);
      const b = body();
      expect((await call(POST, { method: "POST", body: b })).status).toBe(201);
      const again = await call(POST, { method: "POST", body: b });
      expect(again.status).toBe(200);
      const list = await call(GET, { query: `?set=${set.id}` });
      expect(list.body.rows.filter((r: { description: string }) => r.description === "12 bags of sawdust")).toHaveLength(1);
      expect(list.body.summary.onSets.total).toBe(475_000 + 18_500);
    });
  });

  it("refuses an expense with no Set and no overhead, or both", async () => {
    await withApi(async (tx) => {
      const { body, set } = await farm(tx);
      const none = await call(POST, { method: "POST", body: body({ setId: null, overhead: false }) });
      expect(none.body.error).toMatchObject({ message: "Choose a Set or farm overhead before saving." });
      expect((await call(POST, { method: "POST", body: body({ setId: set.id, overhead: true }) })).status).toBe(422);
      expect((await call(POST, { method: "POST", body: body({ setId: null, overhead: true }) })).status).toBe(201);
    });
  });

  it("flags a matching expense entered separately as a likely repeat", async () => {
    await withApi(async (tx) => {
      const { body } = await farm(tx);
      const first = await call(POST, { method: "POST", body: body() });
      const second = await call(POST, { method: "POST", body: body() });
      expect(second.status).toBe(201);
      expect(second.body.possibleDuplicateOf).toBe(first.body.id);
    });
  });

  it("allows capital items only in capital categories and keeps them out of running costs", async () => {
    await withApi(async (tx) => {
      const { body, cat } = await farm(tx);
      const wrong = await call(POST, { method: "POST", body: body({ capitalItem: true }) });
      expect(wrong.body.error.message).toBe("Litter (sawdust) can't be a capital item.");
      await call(POST, { method: "POST", body: body({ categoryId: cat("equipment"), description: "Drinker set", amount: 42_000, setId: null, overhead: true, capitalItem: true }) });
      const { body: list } = await call(GET, { query: "?month=2026-09" });
      expect(list.summary.capital).toEqual({ total: 42_000, count: 1 });
      expect(list.summary.byCategory.map((c: { label: string }) => c.label)).not.toContain("Equipment and structures");
    });
  });

  it("needs a reason to change an old amount, and only owners remove", async () => {
    await withApi(async (tx) => {
      const { body, owner } = await farm(tx);
      const { body: e } = await call(POST, { method: "POST", body: body() });
      const noReason = await call(PATCH, { method: "PATCH", params: { id: e.id }, body: { amount: 17_000, baseVersion: 1 } });
      expect(noReason.body.error.message).toBe("Say why you're changing the amount after the day.");
      const ok = await call(PATCH, { method: "PATCH", params: { id: e.id }, body: { amount: 17_000, baseVersion: 1, reason: "Receipt says ₦17,000" } });
      expect(ok.body).toMatchObject({ amount: 17_000, version: 2 });
      expect((await call(DELETE, { method: "DELETE", params: { id: e.id }, body: { reason: "Entered twice" } })).status).toBe(403);
      signInAs(owner);
      expect((await call(DELETE, { method: "DELETE", params: { id: e.id }, body: { reason: "Entered twice" } })).status).toBe(204);
      expect((await call(GET)).body.rows.find((r: { id: string }) => r.id === e.id)).toBeUndefined();
    });
  });

  it("keeps expenses from recorders", async () => {
    await withApi(async (tx) => {
      const { recorder } = await farm(tx);
      signInAs(recorder);
      expect((await call(GET)).status).toBe(403);
    });
  });
});

describe("receipt upload", () => {
  const send = async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const res = await upload(new Request("http://test.local/api/uploads/receipt", { method: "POST", body: form }), { params: Promise.resolve({}) } as never);
    return { status: res.status, body: await res.json() };
  };

  it("stores a photo under a receipts key and refuses other files", async () => {
    await withApi(async (tx) => {
      signInAs((await readyFarm(tx)).manager);
      const ok = await send(new File([new Uint8Array([1, 2, 3])], "r.jpg", { type: "image/jpeg" }));
      expect(ok.status).toBe(201);
      expect(ok.body.key).toMatch(/^receipts\/2026\/09\/[0-9a-f-]{36}\.jpg$/);
      expect(stored).toContain(ok.body.key);
      const bad = await send(new File(["x"], "r.txt", { type: "text/plain" }));
      expect(bad.body.error.message).toBe("Use a photo (JPG, PNG, WebP, HEIC) or a PDF.");
    });
  });
});
