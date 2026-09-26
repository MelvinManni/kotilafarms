// Offline sync, server side: every entry arrives exactly once (docs/07-offline-sync.md › Tests that must exist)
import { eq, inArray } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/sync/route";
import { auditEvents, dailyLogConflicts, dailyLogs, devices, expenseCategories, expenses, sets, setVaccines, syncMutations, users } from "@/db/schema";
import { processSync } from "@/server/services/sync/process";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";
import { testDb } from "@test/db/test-db";

const device = crypto.randomUUID();
const pending = { count: 0, summary: [] };
const logMutation = (userId: string, setId: string, over: Record<string, unknown> = {}, clientId = crypto.randomUUID()) => ({
  mutationId: crypto.randomUUID(), clientId, type: "dailyLog.upsert" as const, userId, enteredOfflineAt: "2026-09-26T17:40:00.000Z",
  payload: { setId, date: "2026-09-26", deaths: 2, tags: ["wet_litter"], ...over },
});
const send = (mutations: unknown[]) => call(POST, { method: "POST", body: { deviceId: device, pending, mutations } });

describe("sync API", () => {
  it("applies an entry once, however often it is sent (lost reply, retry)", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const m = logMutation(recorder.id, set.id);
      const first = await send([m]);
      expect(first.body.results[0]).toMatchObject({ status: "applied", version: 1 });
      const again = await send([m]);
      expect(again.body.results[0]).toMatchObject({ status: "duplicate", id: first.body.results[0].id });
      expect(await tx.select().from(dailyLogs).where(eq(dailyLogs.setId, set.id))).toHaveLength(1);
      const [log] = await tx.select().from(dailyLogs).where(eq(dailyLogs.setId, set.id));
      expect(log!.enteredOfflineAt?.toISOString()).toBe("2026-09-26T17:40:00.000Z");
      const [d] = await tx.select().from(devices).where(eq(devices.id, device));
      expect(d!.userId).toBe(recorder.id);
    });
  });

  it("refuses the same mutation id with a different payload, and writes nothing", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const m = logMutation(recorder.id, set.id);
      await send([m]);
      const changed = await send([{ ...m, payload: { ...m.payload, deaths: 9 } }]);
      expect(changed.body.results[0]).toMatchObject({ status: "rejected", error: { code: "MUTATION_ID_REUSED" } });
      const [log] = await tx.select().from(dailyLogs).where(eq(dailyLogs.setId, set.id));
      expect(log!.deaths).toBe(2);
    });
  });

  it("turns two devices logging the same day into one conflict, even when replayed", async () => {
    await withApi(async (tx) => {
      const { owner, manager, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      await send([logMutation(recorder.id, set.id)]);
      signInAs(manager);
      const theirs = logMutation(manager.id, set.id, { deaths: 5 });
      const a = await send([theirs]);
      const b = await send([theirs]);
      expect(a.body.results[0].status).toBe("conflict");
      expect(b.body.results[0]).toMatchObject({ status: "conflict", conflictId: a.body.results[0].conflictId });
      expect(await tx.select().from(dailyLogConflicts)).toHaveLength(1);
      expect(await tx.select().from(dailyLogs).where(eq(dailyLogs.setId, set.id))).toHaveLength(1);
    });
  });

  it("makes a stale offline edit a conflict and leaves the log unchanged", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const clientId = crypto.randomUUID();
      await send([logMutation(recorder.id, set.id, {}, clientId)]);
      await send([logMutation(recorder.id, set.id, { deaths: 3, baseVersion: 1 }, clientId)]);
      const stale = await send([logMutation(recorder.id, set.id, { deaths: 7, baseVersion: 1 }, clientId)]);
      expect(stale.body.results[0].status).toBe("conflict");
      const [log] = await tx.select().from(dailyLogs).where(eq(dailyLogs.setId, set.id));
      expect(log).toMatchObject({ deaths: 3, version: 2 });
    });
  });

  it("rejects entries that are wrong, from someone else, or not allowed — without stopping the rest", async () => {
    await withApi(async (tx) => {
      const { owner, manager, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const [cat] = await tx.select().from(expenseCategories).where(eq(expenseCategories.key, "other"));
      const res = await send([
        logMutation(recorder.id, set.id, { deaths: -1 }),
        logMutation(manager.id, set.id),
        { mutationId: crypto.randomUUID(), clientId: crypto.randomUUID(), type: "expense.create", userId: recorder.id, payload: { date: "2026-09-26", categoryId: cat!.id, description: "Diesel", amount: 12_000, setId: null, overhead: true } },
        logMutation(recorder.id, set.id, { date: "2026-09-25" }),
      ]);
      expect(res.body.results.map((r: { status: string; error?: { code: string } }) => [r.status, r.error?.code])).toEqual([
        ["rejected", "validation"], ["rejected", "WRONG_USER"], ["rejected", "forbidden"], ["applied", undefined],
      ]);
    });
  });

  it("saves a matching expense from another device and flags it as a likely repeat", async () => {
    await withApi(async (tx) => {
      const { owner, manager } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      const [cat] = await tx.select().from(expenseCategories).where(eq(expenseCategories.key, "litter"));
      const expense = (userId: string) => ({ mutationId: crypto.randomUUID(), clientId: crypto.randomUUID(), type: "expense.create", userId, payload: { date: "2026-09-26", categoryId: cat!.id, description: "Sawdust", amount: 18_500, setId: set.id, overhead: false } });
      signInAs(owner);
      const first = await send([expense(owner.id)]);
      signInAs(manager);
      const second = await send([expense(manager.id)]);
      expect(second.body.results[0]).toMatchObject({ status: "applied", possibleDuplicateOf: first.body.results[0].id });
    });
  });
});

describe("sync under a race", () => {
  it("two copies of one request at the same moment make one row: one applied, one duplicate", async () => {
    const db = testDb();
    const email = `race-${crypto.randomUUID()}@example.com`;
    const [owner] = await db.insert(users).values({ name: "Race Owner", email, role: "owner", passwordHash: "x" }).returning();
    const user = { id: owner!.id, name: owner!.name, email, role: "owner" as const };
    const { insertReferenceData } = await import("@/db/setup/insert-reference-data");
    await insertReferenceData(db, owner!.id);
    const { startSet } = await import("@/server/services/sets/start");
    const { set } = await startSet(db, { clientId: crypto.randomUUID(), pen: "Back pen", startDate: "2026-09-02", intake: 500, dayOldSupplier: "Chi Farms", dayOldUnitCost: 950 }, user);
    const m = logMutation(owner!.id, set.id);
    const req = { deviceId: crypto.randomUUID(), pending, mutations: [m] };
    try {
      const [a, b] = await Promise.all([processSync(db, req, user, "2026-09-26"), processSync(db, { ...req, deviceId: req.deviceId }, user, "2026-09-26")]);
      expect([a[0]!.status, b[0]!.status].sort()).toEqual(["applied", "duplicate"]);
      expect(await db.select().from(dailyLogs).where(eq(dailyLogs.setId, set.id))).toHaveLength(1);
    } finally {
      // Committed rows: remove them so other tests see a clean database
      await db.delete(syncMutations).where(eq(syncMutations.userId, owner!.id));
      await db.delete(dailyLogs).where(eq(dailyLogs.setId, set.id));
      await db.delete(setVaccines).where(eq(setVaccines.setId, set.id));
      await db.delete(expenses).where(eq(expenses.setId, set.id));
      await db.delete(sets).where(eq(sets.id, set.id));
      await db.delete(devices).where(eq(devices.userId, owner!.id));
      await db.delete(auditEvents).where(eq(auditEvents.userId, owner!.id));
      const { breedCurves, stockTypes, vaccineScheduleDefaults, settings } = await import("@/db/schema");
      await db.delete(settings);
      for (const t of [vaccineScheduleDefaults, breedCurves, stockTypes, expenseCategories]) await db.delete(t).where(eq(t.createdBy, owner!.id));
      await db.delete(users).where(inArray(users.id, [owner!.id]));
    }
  });
});
