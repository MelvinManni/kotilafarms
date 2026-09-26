// Sets API end to end: start a Set, read it back, change its stage; roles and money are respected
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET as getOne, PATCH } from "@/app/api/sets/[id]/route";
import { GET as list, POST } from "@/app/api/sets/route";
import { auditEvents, dailyLogs, expenses, setVaccines } from "@/db/schema";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { SET4, readyFarm } from "@test/db/farm";

const clientId = () => crypto.randomUUID();

describe("sets API", () => {
  it("starts a Set with its vaccine schedule and day-olds expense", async () => {
    await withApi(async (tx) => {
      const { manager } = await readyFarm(tx);
      signInAs(manager);
      const res = await call(POST, { method: "POST", body: { clientId: clientId(), ...SET4 } });
      expect(res.status).toBe(201);
      const vaccines = await tx.select().from(setVaccines).where(eq(setVaccines.setId, res.body.id));
      expect(vaccines.map((v) => `${v.item} ${v.doseNo} day ${v.dueAgeDays}`).sort()).toEqual(["Gumboro 1 day 7", "Gumboro 2 day 14", "Lasota 1 day 10", "Lasota 2 day 21"]);
      const [dayOlds] = await tx.select().from(expenses).where(eq(expenses.setId, res.body.id));
      expect(dayOlds).toMatchObject({ amount: 475_000, description: "500 day-olds from Chi Farms", overhead: false });
      const detail = await call(getOne, { params: { id: res.body.id } });
      expect(detail.body).toMatchObject({ number: res.body.number, dayOfAge: 24, liveBirds: 500, status: "brooding" });
      expect(detail.body.spendByCategory).toEqual([{ label: "Day-old chicks", value: 475_000 }]);
    });
  });

  it("returns the same Set when the same clientId is sent twice", async () => {
    await withApi(async (tx) => {
      const { owner } = await readyFarm(tx);
      signInAs(owner);
      const body = { clientId: clientId(), ...SET4 };
      const first = await call(POST, { method: "POST", body });
      const again = await call(POST, { method: "POST", body });
      expect(again.status).toBe(200);
      expect(again.body.id).toBe(first.body.id);
      expect((await call(list)).body).toHaveLength(1);
    });
  });

  it("gives recorders counts without money and refuses them starting a Set", async () => {
    await withApi(async (tx) => {
      const { owner, recorder } = await readyFarm(tx);
      signInAs(owner);
      const { body } = await call(POST, { method: "POST", body: { clientId: clientId(), ...SET4 } });
      await tx.insert(dailyLogs).values([
        { clientId: clientId(), createdBy: recorder.id, setId: body.id, date: "2026-09-24", deaths: 3 },
        { clientId: clientId(), createdBy: recorder.id, setId: body.id, date: "2026-09-10", deaths: 2 },
      ]);
      signInAs(recorder);
      expect((await call(POST, { method: "POST", body: { clientId: clientId(), ...SET4 } })).status).toBe(403);
      const [set] = (await call(list)).body;
      expect(set).toMatchObject({ liveBirds: 495, deaths: 5, trend: { thisWeek: 3, lastWeek: 0 } });
      expect(set.money).toBeUndefined();
      expect((await call(getOne, { params: { id: body.id } })).body.spendByCategory).toBeUndefined();
    });
  });

  it("closes a Set on a date, audits it, and refuses a date before the start", async () => {
    await withApi(async (tx) => {
      const { owner } = await readyFarm(tx);
      signInAs(owner);
      const { body } = await call(POST, { method: "POST", body: { clientId: clientId(), ...SET4 } });
      const early = await call(PATCH, { method: "PATCH", params: { id: body.id }, body: { status: "closed", closedOn: "2026-08-01" } });
      expect(early.status).toBe(422);
      const closed = await call(PATCH, { method: "PATCH", params: { id: body.id }, body: { status: "closed", closedOn: "2026-09-20" } });
      expect(closed.body).toMatchObject({ status: "closed", closedOn: "2026-09-20", dayOfAge: 18 });
      const audit = await tx.select().from(auditEvents).where(eq(auditEvents.rowId, body.id));
      expect(audit.map((a) => a.field).filter(Boolean).sort()).toEqual(["closedOn", "status"]);
    });
  });

  it("answers 404 for an unknown Set", async () => {
    await withApi(async (tx) => {
      signInAs((await readyFarm(tx)).owner);
      expect((await call(getOne, { params: { id: crypto.randomUUID() } })).status).toBe(404);
    });
  });
});
