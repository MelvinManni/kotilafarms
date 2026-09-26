// Today API: tasks and missed days for everyone; money only for owners and managers
import { describe, expect, it } from "vitest";
import { POST as log } from "@/app/api/sets/[id]/logs/route";
import { POST as weigh } from "@/app/api/sets/[id]/weights/route";
import { GET } from "@/app/api/today/route";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

describe("today API", () => {
  it("names missed days, what needs doing, and hides money from recorders", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      const set5 = await makeSet(tx, owner, { startDate: "2026-09-20", intake: 600, dayOldSupplier: "Zartech", dayOldUnitCost: 980 });
      signInAs(recorder);
      for (const date of ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24"]) await call(log, { method: "POST", params: { id: set5.id }, body: { clientId: crypto.randomUUID(), date, deaths: 1 } });
      const r = await call(GET);
      expect(r.body.missed).toEqual([{ setId: set5.id, setNumber: set5.number, date: "2026-09-25" }]);
      expect(r.body.tasks.map((t: { title: string }) => t.title)).toEqual([`Log Set ${set5.number} for today`, `Gumboro due tomorrow · Set ${set5.number}`, `Weigh Set ${set5.number} on Sunday`]);
      expect(r.body.owed).toBeUndefined();
      expect(r.body.sets[0].money).toBeUndefined();
      signInAs(owner);
      const o = await call(GET);
      expect(o.body.owed).toMatchObject({ buyers: 0 });
      expect(o.body.sets[0].money.spend).toBe(588_000);
    });
  });

  it("leads the growth panel with the Set furthest under its standard", async () => {
    await withApi(async (tx) => {
      const { owner } = await readyFarm(tx);
      signInAs(owner);
      expect((await call(GET)).body.growthSetId).toBeNull();
      const onTrack = await makeSet(tx, owner, { startDate: "2026-09-12" });
      const behind = await makeSet(tx, owner, { startDate: "2026-09-12" });
      const sample = (id: string, grams: number) => call(weigh, { method: "POST", params: { id }, body: { clientId: crypto.randomUUID(), date: "2026-09-26", weightsGrams: [grams, grams] } });
      await sample(onTrack.id, 480);
      await sample(behind.id, 400);
      expect((await call(GET)).body.growthSetId).toBe(behind.id);
    });
  });
});
