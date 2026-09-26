// Health API end to end: vaccine schedule and marking doses, treatments with their expense, and the default schedule
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET as vaccines, PATCH as mark } from "@/app/api/sets/[id]/vaccines/route";
import { POST as startSet } from "@/app/api/sets/route";
import { GET as schedule, PATCH as saveSchedule } from "@/app/api/settings/vaccine-schedule/route";
import { GET as records, POST as record } from "@/app/api/health/route";
import { auditEvents, expenses } from "@/db/schema";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

type Tx = Parameters<Parameters<typeof withApi>[0]>[0];

async function farm(tx: Tx) {
  const people = await readyFarm(tx);
  // Set 5: started 20 Sep, day 6 on Sat 26 Sep
  const set = await makeSet(tx, people.owner, { startDate: "2026-09-20", intake: 600 });
  signInAs(people.manager);
  return { ...people, set };
}

describe("health API", () => {
  it("shows the schedule with what is due, and marks a dose given (audited), or clears it", async () => {
    await withApi(async (tx) => {
      const { set } = await farm(tx);
      const params = { id: set.id };
      const list = (await call(vaccines, { params })).body;
      expect(list.map((v: { item: string; state: string }) => `${v.item} ${v.state}`)).toEqual(["Gumboro due-tomorrow", "Lasota upcoming", "Gumboro upcoming", "Lasota upcoming"]);
      const after = (await call(mark, { method: "PATCH", params, body: { vaccineId: list[0].id, givenOn: "2026-09-26" } })).body;
      expect(after[0]).toMatchObject({ state: "given", givenDay: 6, givenBy: "Adaeze Nwankwo" });
      expect(await tx.select().from(auditEvents).where(eq(auditEvents.rowId, list[0].id))).not.toHaveLength(0);
      expect((await call(mark, { method: "PATCH", params, body: { vaccineId: list[0].id, givenOn: "2026-09-27" } })).status).toBe(422);
      expect((await call(mark, { method: "PATCH", params, body: { vaccineId: list[0].id, givenOn: null } })).body[0]).toMatchObject({ state: "due-tomorrow", givenBy: null });
    });
  });

  it("records a treatment once, with its cost as a Drugs and vaccines expense on the Set", async () => {
    await withApi(async (tx) => {
      const { set } = await farm(tx);
      const body = { clientId: crypto.randomUUID(), setId: set.id, date: "2026-09-21", item: "Elrox", dose: "100 g in drinking water · 5 days", cost: 4_500, reason: "Cover day-olds in the first week" };
      expect((await call(record, { method: "POST", body })).status).toBe(201);
      expect((await call(record, { method: "POST", body })).status).toBe(200);
      expect((await call(records, { query: `?setId=${set.id}` })).body).toMatchObject([{ item: "Elrox", cost: 4_500, set: { id: set.id }, by: "Adaeze Nwankwo" }]);
      const [e] = await tx.select().from(expenses).where(eq(expenses.amount, 4_500));
      expect(e).toMatchObject({ setId: set.id, description: "Elrox, 100 g in drinking water · 5 days" });
      const free = await call(record, { method: "POST", body: { ...body, clientId: crypto.randomUUID(), item: "Glucose", cost: null } });
      expect(free.status).toBe(201);
      expect((await call(record, { method: "POST", body: { ...body, clientId: crypto.randomUUID(), reason: "" } })).status).toBe(422);
    });
  });

  it("keeps recorders out", async () => {
    await withApi(async (tx) => {
      const { set, recorder } = await farm(tx);
      signInAs(recorder);
      expect((await call(vaccines, { params: { id: set.id } })).status).toBe(403);
      expect((await call(records)).status).toBe(403);
    });
  });

  it("changes the default schedule for Sets started after it", async () => {
    await withApi(async (tx) => {
      await farm(tx);
      const rows = (await call(schedule)).body as { id: string; item: string; doseNo: number; dueAgeDays: number; method: string }[];
      const next = [...rows.filter((r) => r.item !== "Lasota" || r.doseNo !== 2).map((r) => (r.item === "Gumboro" && r.doseNo === 2 ? { ...r, dueAgeDays: 16 } : r)), { item: "Fowl pox", doseNo: 1, dueAgeDays: 28, method: "Wing web" }];
      const saved = (await call(saveSchedule, { method: "PATCH", body: { rows: next } })).body;
      expect(saved.map((r: { item: string; dueAgeDays: number }) => `${r.item} ${r.dueAgeDays}`)).toEqual(["Gumboro 7", "Lasota 10", "Gumboro 16", "Fowl pox 28"]);
      const started = await call(startSet, { method: "POST", body: { clientId: crypto.randomUUID(), pen: "Front pen", startDate: "2026-09-26", intake: 500, dayOldSupplier: "Zartech", dayOldUnitCost: 980 } });
      const theirs = (await call(vaccines, { params: { id: started.body.id } })).body;
      expect(theirs.map((v: { item: string; dueAgeDays: number; method: string }) => `${v.item} ${v.dueAgeDays}`)).toEqual(["Gumboro 7", "Lasota 10", "Gumboro 16", "Fowl pox 28"]);
      expect(theirs.at(-1).method).toBe("Wing web");
    });
  });
});
