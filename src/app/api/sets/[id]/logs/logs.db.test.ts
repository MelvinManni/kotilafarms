// Daily log API end to end: save, resend, edit, someone else's day, late changes, roles
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { PATCH } from "@/app/api/logs/[id]/route";
import { GET as missing } from "@/app/api/sets/[id]/missing-days/route";
import { GET, POST } from "@/app/api/sets/[id]/logs/route";
import { GET as audit } from "@/app/api/audit/route";
import { dailyLogConflicts, dailyLogs } from "@/db/schema";
import { upsertDailyLog } from "@/server/services/daily-logs/upsert";
import { apiState, signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

const newLog = (over: Record<string, unknown> = {}) => ({ clientId: crypto.randomUUID(), date: "2026-09-26", deaths: 2, tags: ["wet_litter"], ...over });

describe("daily log API", () => {
  it("saves a log once, however many times it is sent", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const body = newLog();
      const first = await call(POST, { method: "POST", params: { id: set.id }, body });
      expect(first.status).toBe(201);
      expect(first.body).toMatchObject({ deaths: 2, dayOfAge: 24, tags: ["wet_litter"], createdBy: { name: "Chinedu Okafor" } });
      const again = await call(POST, { method: "POST", params: { id: set.id }, body });
      expect(again.status).toBe(200);
      expect(again.body.id).toBe(first.body.id);
      expect(await tx.select().from(dailyLogs).where(eq(dailyLogs.setId, set.id))).toHaveLength(1);
    });
  });

  it("lets the same person change today's log, and refuses a stale copy", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const body = newLog();
      await call(POST, { method: "POST", params: { id: set.id }, body });
      const edited = await call(POST, { method: "POST", params: { id: set.id }, body: { ...body, deaths: 3, baseVersion: 1 } });
      expect(edited.body).toMatchObject({ deaths: 3, version: 2 });
      expect(edited.body.edits).toEqual([expect.objectContaining({ field: "deaths", from: 2, to: 3, by: "Chinedu Okafor" })]);
      const stale = await call(PATCH, { method: "PATCH", params: { id: edited.body.id }, body: { deaths: 4, baseVersion: 1 } });
      expect(stale.status).toBe(409);
    });
  });

  it("points to the existing log when someone else logged that day", async () => {
    await withApi(async (tx) => {
      const { owner, manager, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      await call(POST, { method: "POST", params: { id: set.id }, body: newLog() });
      signInAs(manager);
      const clash = await call(POST, { method: "POST", params: { id: set.id }, body: newLog({ deaths: 5 }) });
      expect(clash.status).toBe(409);
      expect(clash.body.error.message).toBe(`Set ${set.number} already has a log for 2026-09-26. Open it to change it.`);
      expect(await tx.select().from(dailyLogConflicts)).toHaveLength(0);
    });
  });

  it("records one conflict for offline sync, however often it is replayed", async () => {
    await withApi(async (tx) => {
      const { owner, manager, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      await upsertDailyLog(tx, set.id, { ...newLog(), feedUnit: "bags", tags: [] }, recorder, "2026-09-26", { onConflict: "reject" });
      const mutationId = crypto.randomUUID();
      const input = { ...newLog({ deaths: 4 }), feedUnit: "bags" as const, tags: [] };
      const a = await upsertDailyLog(tx, set.id, input, manager, "2026-09-26", { onConflict: "record", mutationId });
      const b = await upsertDailyLog(tx, set.id, input, manager, "2026-09-26", { onConflict: "record", mutationId });
      expect(a.status).toBe("conflict");
      expect(b).toEqual(a);
      expect(await tx.select().from(dailyLogConflicts)).toHaveLength(1);
    });
  });

  it("needs a reason to change a past day's count, and keeps recorders to their own same-day logs", async () => {
    await withApi(async (tx) => {
      const { owner, manager, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(recorder);
      const { body: log } = await call(POST, { method: "POST", params: { id: set.id }, body: newLog({ date: "2026-09-24", deaths: 3 }) });
      expect((await call(PATCH, { method: "PATCH", params: { id: log.id }, body: { deaths: 2, baseVersion: 1 } })).status).toBe(403);
      signInAs(manager);
      const noReason = await call(PATCH, { method: "PATCH", params: { id: log.id }, body: { deaths: 2, baseVersion: 1 } });
      expect(noReason.body.error.message).toBe("Say why you're changing this after the day.");
      const withReason = await call(PATCH, { method: "PATCH", params: { id: log.id }, body: { deaths: 2, baseVersion: 1, reason: "One bird counted twice." } });
      expect(withReason.body.deaths).toBe(2);
      const history = await call(audit, { query: `?table=daily_logs&rowId=${log.id}` });
      expect(history.body.map((e: { action: string; field: string | null }) => [e.action, e.field])).toEqual([["create", null], ["update", "deaths"]]);
      expect(history.body[1].reason).toBe("One bird counted twice.");
      signInAs(recorder);
      expect((await call(audit, { query: `?table=daily_logs&rowId=${log.id}` })).status).toBe(403);
    });
  });

  it("refuses days outside the Set, feed without a type, and names missed days", async () => {
    await withApi(async (tx) => {
      const { owner } = await readyFarm(tx);
      const set = await makeSet(tx, owner, { startDate: "2026-09-20" });
      signInAs(owner);
      expect((await call(POST, { method: "POST", params: { id: set.id }, body: newLog({ date: "2026-09-19" }) })).status).toBe(422);
      expect((await call(POST, { method: "POST", params: { id: set.id }, body: newLog({ date: "2026-09-27" }) })).status).toBe(422);
      const noType = await call(POST, { method: "POST", params: { id: set.id }, body: newLog({ feedQty: 2 }) });
      expect(noType.body.error.issues[0]).toEqual({ path: "feedTypeId", message: "Choose the feed type." });
      for (const date of ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24"]) await call(POST, { method: "POST", params: { id: set.id }, body: newLog({ date }) });
      expect((await call(missing, { params: { id: set.id } })).body).toEqual(["2026-09-25"]);
      expect((await call(GET, { params: { id: set.id } })).body.map((l: { date: string }) => l.date)).toEqual(["2026-09-24", "2026-09-23", "2026-09-22", "2026-09-21"]);
      expect(apiState.today).toBe("2026-09-26");
    });
  });
});

describe("editing one field", () => {
  it("leaves the other fields as they were", async () => {
    await withApi(async (tx) => {
      const { owner } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(owner);
      const { body: log } = await call(POST, { method: "POST", params: { id: set.id }, body: newLog({ tags: ["coughing", "wet_litter"], note: "Corner by the drinkers" }) });
      const res = await call(PATCH, { method: "PATCH", params: { id: log.id }, body: { deaths: 1, baseVersion: 1 } });
      expect(res.body).toMatchObject({ deaths: 1, tags: ["coughing", "wet_litter"], note: "Corner by the drinkers", feedUnit: "bags" });
      expect(res.body.edits).toHaveLength(1);
    });
  });
});
