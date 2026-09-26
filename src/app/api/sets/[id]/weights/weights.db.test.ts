// Weights API end to end: saving once, stats from the breed standard, likely repeats, and the breed curve setting
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/sets/[id]/weights/route";
import { GET as getCurve, PATCH as saveCurve } from "@/app/api/settings/breed-curve/route";
import { POST as sync } from "@/app/api/sync/route";
import { auditEvents, weightSamples } from "@/db/schema";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

// Set 4's day-24 sample from the design: averages 1030 g
const SET4_DAY24 = [1018, 964, 1088, 862, 1041, 1004, 1148, 982, 1055, 905, 1033, 1096, 995, 1062, 1187, 948, 1027, 1109, 918, 1071, 1012, 1058, 1034, 1103];
const sample = (over: Record<string, unknown> = {}) => ({ clientId: crypto.randomUUID(), date: "2026-09-26", weightsGrams: SET4_DAY24, ...over });

describe("weights API", () => {
  it("saves a sample once, however often it is sent, and works out its figures", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const body = sample();
      const params = { id: set.id };
      expect((await call(POST, { method: "POST", body, params })).status).toBe(201);
      expect((await call(POST, { method: "POST", body, params })).status).toBe(200);
      const { body: list } = await call(GET, { params });
      expect(list.samples).toHaveLength(1);
      expect(list.samples[0]).toMatchObject({ ageDays: 24, count: 24, averageGrams: 1030, by: recorder.name });
      expect(list.samples[0].uniformity).toBeCloseTo(0.79, 1);
      expect(list.standard.length).toBeGreaterThan(2);
      const [row] = await tx.select().from(weightSamples).where(eq(weightSamples.setId, set.id));
      expect(await tx.select().from(auditEvents).where(eq(auditEvents.rowId, row!.id))).toHaveLength(1);
    });
  });

  it("flags the same weights saved again on the same day, but keeps both", async () => {
    await withApi(async (tx) => {
      const { owner, manager } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(owner);
      const first = await call(POST, { method: "POST", body: sample(), params: { id: set.id } });
      signInAs(manager);
      const second = await call(POST, { method: "POST", body: sample({ weightsGrams: [...SET4_DAY24].reverse() }), params: { id: set.id } });
      expect(second.status).toBe(201);
      expect(second.body.possibleDuplicateOf).toBe(first.body.id);
      const different = await call(POST, { method: "POST", body: sample({ weightsGrams: [1000, 1010] }), params: { id: set.id } });
      expect(different.body.possibleDuplicateOf).toBeNull();
    });
  });

  it("refuses weights that can't be right and days outside the Set", async () => {
    await withApi(async (tx) => {
      const { owner } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(owner);
      const params = { id: set.id };
      expect((await call(POST, { method: "POST", body: sample({ weightsGrams: [1.03] }), params })).status).toBe(422);
      expect((await call(POST, { method: "POST", body: sample({ weightsGrams: [] }), params })).status).toBe(422);
      expect((await call(POST, { method: "POST", body: sample({ date: "2026-09-27" }), params })).status).toBe(422);
      expect((await call(POST, { method: "POST", body: sample({ date: "2026-08-30" }), params })).status).toBe(422);
    });
  });

  it("arrives through the phone outbox once, flagged when it repeats another phone's sample", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const m = (clientId = crypto.randomUUID()) => ({ mutationId: crypto.randomUUID(), clientId, type: "weightSample.create", userId: recorder.id, payload: { setId: set.id, date: "2026-09-26", weightsGrams: SET4_DAY24 } });
      const one = m();
      const send = (mutations: unknown[]) => call(sync, { method: "POST", body: { deviceId: crypto.randomUUID(), pending: { count: 0, summary: [] }, mutations } });
      const first = await send([one]);
      expect(first.body.results[0]).toMatchObject({ status: "applied" });
      expect((await send([one])).body.results[0]).toMatchObject({ status: "duplicate", id: first.body.results[0].id });
      expect((await send([m()])).body.results[0]).toMatchObject({ status: "applied", possibleDuplicateOf: first.body.results[0].id });
      expect(await tx.select().from(weightSamples).where(eq(weightSamples.setId, set.id))).toHaveLength(2);
    });
  });
});

describe("breed curve API", () => {
  it("lets managers change the standard, audits it, and Sets measure against it", async () => {
    await withApi(async (tx) => {
      const { owner, manager, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      expect((await call(saveCurve, { method: "PATCH", body: { points: [{ day: 0, grams: 42 }, { day: 42, grams: 2850 }] } })).status).toBe(403);
      signInAs(manager);
      const saved = await call(saveCurve, { method: "PATCH", body: { points: [{ day: 48, grams: 3000 }, { day: 0, grams: 40 }, { day: 24, grams: 1000 }] } });
      expect(saved.status).toBe(200);
      expect(saved.body.points.map((p: { day: number }) => p.day)).toEqual([0, 24, 48]);
      expect((await call(getCurve)).body.points).toHaveLength(3);
      expect(await tx.select().from(auditEvents).where(eq(auditEvents.rowId, saved.body.id))).toHaveLength(1);
      await call(POST, { method: "POST", body: sample(), params: { id: set.id } });
      const { body } = await call(GET, { params: { id: set.id } });
      expect(body.samples[0]).toMatchObject({ standardGrams: 1000 });
      expect(body.samples[0].gap).toBeCloseTo(0.03, 2);
    });
  });

  it("refuses a curve with repeated days or a single point", async () => {
    await withApi(async (tx) => {
      const { manager } = await readyFarm(tx);
      signInAs(manager);
      expect((await call(saveCurve, { method: "PATCH", body: { points: [{ day: 0, grams: 42 }, { day: 0, grams: 50 }] } })).status).toBe(422);
      expect((await call(saveCurve, { method: "PATCH", body: { points: [{ day: 0, grams: 42 }] } })).status).toBe(422);
    });
  });
});
