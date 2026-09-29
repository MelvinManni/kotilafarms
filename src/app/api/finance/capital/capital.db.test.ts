// Capital and loans API: the share register, Emeka's and Kosi's loans (docs/12-seed-data.md), capacity, owners only
import { describe, expect, it } from "vitest";
import { GET as capital, POST as addEntry } from "@/app/api/finance/capital/route";
import { GET as cash } from "@/app/api/finance/cash/route";
import { PATCH as repay } from "@/app/api/finance/loans/[id]/route";
import { POST as addLoan } from "@/app/api/finance/loans/route";
import { PATCH as editShareholder } from "@/app/api/finance/shareholders/[id]/route";
import { POST as addShareholder } from "@/app/api/finance/shareholders/route";
import { eq } from "drizzle-orm";
import { auditEvents } from "@/db/schema";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";

const REGISTER: [string, number, number, number][] = [["Kosi", 633_858, 1_900_000, 150_000], ["Queen", 122_985, 370_000, 0], ["ThankGod", 122_984, 370_000, 0], ["Emeka", 120_173, 360_000, 40_000]];

describe("capital and loans API", () => {
  it("reproduces the register, both loans and borrowing capacity", async () => {
    await withApi(async (tx) => {
      const { owner, manager } = await readyFarm(tx);
      signInAs(owner);
      const ids: Record<string, string> = {};
      for (const [name, shares, inAmount, outAmount] of REGISTER) {
        const body = { clientId: crypto.randomUUID(), name, shares };
        ids[name] = (await call(addShareholder, { method: "POST", body })).body.id;
        expect((await call(addShareholder, { method: "POST", body })).body.id).toBe(ids[name]);
        await call(addEntry, { method: "POST", body: { clientId: crypto.randomUUID(), shareholderId: ids[name], date: "2026-06-01", kind: "contributed", amount: inAmount } });
        if (outAmount) await call(addEntry, { method: "POST", body: { clientId: crypto.randomUUID(), shareholderId: ids[name], date: "2026-08-01", kind: "withdrawn", amount: outAmount } });
      }
      const emeka = (await call(addLoan, { method: "POST", body: { clientId: crypto.randomUUID(), lenderShareholderId: ids.Emeka, amount: 250_000, advancedOn: "2026-06-15" } })).body;
      await call(addLoan, { method: "POST", body: { clientId: crypto.randomUUID(), lenderShareholderId: ids.Kosi, amount: 500_000, advancedOn: "2026-09-02" } });
      expect((await call(repay, { method: "PATCH", params: { id: emeka.id }, body: { repaidOn: "2026-09-14", baseVersion: emeka.version } })).status).toBe(200);
      expect((await call(repay, { method: "PATCH", params: { id: emeka.id }, body: { repaidOn: "2026-09-14", baseVersion: emeka.version } })).status).toBe(409);

      const { body } = await call(capital);
      expect(body.totals).toEqual({ shares: 1_000_000, contributed: 3_000_000, withdrawn: 190_000, net: 2_810_000 });
      expect(body.shareholders[0]).toMatchObject({ name: "Kosi", net: 1_750_000 });
      expect(body.shareholders[0].ownership).toBeCloseTo(0.6339, 4);
      const [kosiLoan, emekaLoan] = body.loans;
      expect(emekaLoan.interest).toEqual({ days: 91, gross: 9_973, withholdingTax: 997, net: 8_976 });
      expect(kosiLoan.interest).toEqual({ days: 24, gross: 5_260, withholdingTax: 526, net: 4_734 });
      expect(body.capacity).toMatchObject({ outstanding: 500_000, equity: 2_810_000, cap: 1_405_000, headroom: 905_000, overCap: false });

      // Loans and capital are cash too: in when lent or put in, out when repaid (with gross interest) or withdrawn
      const c = (await call(cash)).body;
      expect(c.inRows).toEqual(expect.arrayContaining([{ label: "Shareholder loan from Kosi", value: 500_000 }, { label: "Partner capital from Kosi", value: 1_900_000 }]));
      expect(c.outRows).toEqual(expect.arrayContaining([{ label: "Loan repaid to Emeka", value: 259_973 }, { label: "Withdrawn by Kosi", value: 150_000 }]));

      signInAs(manager);
      expect((await call(capital)).status).toBe(403);
      expect((await call(addLoan, { method: "POST", body: { clientId: crypto.randomUUID(), lenderShareholderId: ids.Kosi, amount: 1, advancedOn: "2026-09-02" } })).status).toBe(403);
    });
  });

  it("corrects the register with a reason, and refuses a stale or unexplained change", async () => {
    await withApi(async (tx) => {
      const { owner, manager } = await readyFarm(tx);
      signInAs(owner);
      const emeka = (await call(addShareholder, { method: "POST", body: { clientId: crypto.randomUUID(), name: "Emeka", shares: 120_000 } })).body;
      const params = { id: emeka.id };
      expect((await call(editShareholder, { method: "PATCH", params, body: { shares: 120_173, baseVersion: emeka.version } })).status).toBe(422);
      const fixed = await call(editShareholder, { method: "PATCH", params, body: { shares: 120_173, baseVersion: emeka.version, reason: "Typed wrong from the register" } });
      expect(fixed.body).toMatchObject({ shares: 120_173, name: "Emeka" });
      const trail = await tx.select().from(auditEvents).where(eq(auditEvents.rowId, emeka.id));
      expect(trail.find((a) => a.field === "shares")).toMatchObject({ reason: "Typed wrong from the register" });
      expect((await call(editShareholder, { method: "PATCH", params, body: { shares: 1, baseVersion: emeka.version, reason: "stale" } })).status).toBe(409);
      signInAs(manager);
      expect((await call(editShareholder, { method: "PATCH", params, body: { shares: 1, baseVersion: fixed.body.version, reason: "nope" } })).status).toBe(403);
    });
  });

  it("removes a shareholder: money stays, shares stop counting, only payouts and no loans; restore undoes it", async () => {
    await withApi(async (tx) => {
      const { owner } = await readyFarm(tx);
      signInAs(owner);
      const add = async (name: string, shares: number, amount: number) => {
        const row = (await call(addShareholder, { method: "POST", body: { clientId: crypto.randomUUID(), name, shares } })).body;
        await call(addEntry, { method: "POST", body: { clientId: crypto.randomUUID(), shareholderId: row.id, date: "2026-06-01", kind: "contributed", amount } });
        return row;
      };
      await add("Kosi", 300, 900_000);
      const nonso = await add("Nonso", 100, 458_000);
      const params = { id: nonso.id };
      expect((await call(editShareholder, { method: "PATCH", params, body: { removed: true, baseVersion: nonso.version } })).status).toBe(422);
      const removed = await call(editShareholder, { method: "PATCH", params, body: { removed: true, baseVersion: nonso.version, reason: "Left the company" } });
      expect(removed.status).toBe(200);

      const { body } = await call(capital);
      expect(body.shareholders.map((s: { name: string }) => s.name)).toEqual(["Kosi"]);
      expect(body.shareholders[0].ownership).toBe(1);
      expect(body.removed[0]).toMatchObject({ name: "Nonso", ownership: 0, net: 458_000, removedOn: expect.any(String) });
      expect(body.totals).toMatchObject({ shares: 300, net: 1_358_000 });

      const moneyIn = await call(addEntry, { method: "POST", body: { clientId: crypto.randomUUID(), shareholderId: nonso.id, date: "2026-09-01", kind: "contributed", amount: 1_000 } });
      expect(moneyIn.status).toBe(422);
      expect(moneyIn.body.error.message).toBe("Nonso was removed from the register. Only money taken out can be recorded for them.");
      // Paying out a removed shareholder is allowed
      const payout = await call(addEntry, { method: "POST", body: { clientId: crypto.randomUUID(), shareholderId: nonso.id, date: "2026-09-01", kind: "withdrawn", amount: 58_000 } });
      expect(payout.status).toBe(201);
      expect((await call(capital)).body.removed[0]).toMatchObject({ withdrawn: 58_000, net: 400_000 });
      const loan = await call(addLoan, { method: "POST", body: { clientId: crypto.randomUUID(), lenderShareholderId: nonso.id, amount: 5_000, advancedOn: "2026-09-01" } });
      expect(loan.status).toBe(422);

      const trail = await tx.select().from(auditEvents).where(eq(auditEvents.rowId, nonso.id));
      expect(trail.find((a) => a.field === "removedAt")).toMatchObject({ reason: "Left the company" });
      const restored = await call(editShareholder, { method: "PATCH", params, body: { removed: false, baseVersion: removed.body.version, reason: "Came back" } });
      expect(restored.body.removedAt).toBeNull();
      expect((await call(capital)).body.shareholders).toHaveLength(2);
    });
  });
});
