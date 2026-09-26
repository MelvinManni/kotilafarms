// Settling a conflict: keep either version; the choice is audited and the conflict closes
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { POST as resolve } from "@/app/api/conflicts/[id]/route";
import { GET } from "@/app/api/conflicts/route";
import { POST as sync } from "@/app/api/sync/route";
import { auditEvents, dailyLogs } from "@/db/schema";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

const m = (userId: string, setId: string, deaths: number) => ({ mutationId: crypto.randomUUID(), clientId: crypto.randomUUID(), type: "dailyLog.upsert", userId, payload: { setId, date: "2026-09-25", deaths, tags: [] } });
const send = (mutation: unknown) => call(sync, { method: "POST", body: { deviceId: crypto.randomUUID(), pending: { count: 0, summary: [] }, mutations: [mutation] } });

describe("conflicts API", () => {
  it("shows both versions and keeps the one from the phone when asked", async () => {
    await withApi(async (tx) => {
      const { owner, manager, recorder } = await readyFarm(tx);
      const set = await makeSet(tx, owner);
      signInAs(manager);
      await send(m(manager.id, set.id, 1));
      signInAs(recorder);
      await send(m(recorder.id, set.id, 3));
      expect((await call(GET)).status).toBe(403);
      signInAs(manager);
      const [c] = (await call(GET)).body;
      expect(c).toMatchObject({ setNumber: set.number, existing: { deaths: 1, by: "Adaeze Nwankwo" }, incoming: { deaths: 3, by: "Chinedu Okafor" } });
      expect((await call(resolve, { method: "POST", params: { id: c.id }, body: { keep: "incoming" } })).status).toBe(204);
      const [log] = await tx.select().from(dailyLogs).where(eq(dailyLogs.setId, set.id));
      expect(log).toMatchObject({ deaths: 3, version: 2 });
      expect((await call(GET)).body).toHaveLength(0);
      const trail = await tx.select().from(auditEvents).where(eq(auditEvents.rowId, log!.id));
      expect(trail.map((a) => a.action)).toEqual(["create", "update", "resolve"]);
    });
  });
});
