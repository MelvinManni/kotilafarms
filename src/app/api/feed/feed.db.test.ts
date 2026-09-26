// Feed API end to end: feed types, purchases with their expenses, ingredients, stock, run-out and prices
import { eq, inArray } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { POST as log } from "@/app/api/sets/[id]/logs/route";
import { GET as listIngredients, POST as addIngredient } from "@/app/api/feed/ingredients/route";
import { GET as prices } from "@/app/api/feed/prices/route";
import { GET as listPurchases, POST as buy } from "@/app/api/feed/purchases/route";
import { GET as stock } from "@/app/api/feed/stock/route";
import { PATCH as editType } from "@/app/api/feed/types/[id]/route";
import { GET as listTypes, POST as addType } from "@/app/api/feed/types/route";
import { auditEvents, expenseCategories, expenses } from "@/db/schema";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

type Tx = Parameters<Parameters<typeof withApi>[0]>[0];

async function farm(tx: Tx) {
  const people = await readyFarm(tx);
  const set = await makeSet(tx, people.owner);
  signInAs(people.manager);
  const finisher = (await call(addType, { method: "POST", body: { kind: "finisher", brand: "Ultima", kgPerBag: 25 } })).body;
  const purchase = (over: Record<string, unknown> = {}) => ({ clientId: crypto.randomUUID(), date: "2026-09-22", feedTypeId: finisher.id, bags: 20, kgPerBag: 25, pricePerBag: 24_800, total: 496_000, transportCost: 7_500, supplier: "Ultima depot, Nsukka", setId: set.id, overhead: false, ...over });
  return { ...people, set, finisher, purchase };
}

describe("feed API", () => {
  it("records a purchase once, with a Feed expense and a separate Transport expense on the Set", async () => {
    await withApi(async (tx) => {
      const { purchase, set } = await farm(tx);
      const body = purchase();
      const first = await call(buy, { method: "POST", body });
      expect(first.status).toBe(201);
      expect((await call(buy, { method: "POST", body })).status).toBe(200);
      const rows = (await call(listPurchases)).body;
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ feed: "Finisher · Ultima", bags: 20, pricePerBag: 24_800, transportCost: 7_500, set: { id: set.id } });
      const cats = await tx.select().from(expenseCategories).where(inArray(expenseCategories.key, ["feed", "transport"]));
      const spent = await tx.select().from(expenses).where(inArray(expenses.categoryId, cats.map((c) => c.id)));
      expect(spent.map((e) => e.amount).sort()).toEqual([496_000, 7_500].sort());
      expect(spent.every((e) => e.setId === set.id)).toBe(true);
      expect(await tx.select().from(auditEvents).where(eq(auditEvents.rowId, first.body.id))).toHaveLength(1);
    });
  });

  it("refuses totals that don't match, missing bags, and no Set or store", async () => {
    await withApi(async (tx) => {
      const { purchase } = await farm(tx);
      expect((await call(buy, { method: "POST", body: purchase({ total: 400_000 }) })).body.error.issues[0].message).toBe("Bags × price per bag doesn't match the total.");
      expect((await call(buy, { method: "POST", body: purchase({ bags: 0 }) })).status).toBe(422);
      expect((await call(buy, { method: "POST", body: purchase({ setId: null, overhead: false }) })).status).toBe(422);
      // Price worked out from the total and rounded still agrees: 3 bags for ₦74,500
      expect((await call(buy, { method: "POST", body: purchase({ bags: 3, pricePerBag: 24_833, total: 74_500 }) })).status).toBe(201);
      expect((await call(buy, { method: "POST", body: purchase({ setId: null, overhead: true, transportCost: 0 }) })).status).toBe(201);
    });
  });

  it("keeps recorders out of feed money", async () => {
    await withApi(async (tx) => {
      const { recorder, purchase } = await farm(tx);
      signInAs(recorder);
      expect((await call(buy, { method: "POST", body: purchase() })).status).toBe(403);
      expect((await call(stock)).status).toBe(403);
      expect((await call(listTypes)).status).toBe(200);
    });
  });

  it("works out stock, daily use and days left from purchases and the daily log", async () => {
    await withApi(async (tx) => {
      const { purchase, set, finisher, recorder, owner } = await farm(tx);
      await call(buy, { method: "POST", body: purchase({ bags: 20, total: 496_000 }) });
      signInAs(recorder);
      const logs: [string, number, string][] = [["2026-09-23", 2, "bags"], ["2026-09-24", 2.5, "bags"], ["2026-09-25", 50, "kg"], ["2026-09-26", 2.5, "bags"]];
      for (const [date, feedQty, feedUnit] of logs) await call(log, { method: "POST", params: { id: set.id }, body: { clientId: crypto.randomUUID(), date, deaths: 0, feedTypeId: finisher.id, feedQty, feedUnit } });
      signInAs(owner);
      const { body } = await call(stock);
      const row = body.rows.find((r: { feedTypeId: string }) => r.feedTypeId === finisher.id);
      expect(row).toMatchObject({ stockBags: 11, bagsPerDay: 2.3, lastPrice: 24_800, eating: [{ id: set.id }] });
      expect(row.daysLeft).toBeCloseTo(11 / 2.3, 2);
    });
  });

  it("lists prices oldest first and records ingredients as Feed expenses on their Set", async () => {
    await withApi(async (tx) => {
      const { purchase, finisher, set } = await farm(tx);
      await call(buy, { method: "POST", body: purchase({ date: "2026-09-22", bags: 20, pricePerBag: 24_800, total: 496_000 }) });
      await call(buy, { method: "POST", body: purchase({ date: "2026-09-02", bags: 36, pricePerBag: 23_800, total: 856_800 }) });
      expect((await call(prices, { query: `?feedTypeId=${finisher.id}` })).body.map((p: { pricePerBag: number }) => p.pricePerBag)).toEqual([23_800, 24_800]);
      const ing = { clientId: crypto.randomUUID(), date: "2026-09-12", setId: set.id, ingredient: "Maize", quantity: 100, unit: "kg", unitCost: 645, total: 64_500, supplier: "Ogige market" };
      expect((await call(addIngredient, { method: "POST", body: ing })).status).toBe(201);
      expect((await call(addIngredient, { method: "POST", body: ing })).status).toBe(200);
      expect((await call(listIngredients)).body).toMatchObject([{ ingredient: "Maize", total: 64_500, set: { id: set.id } }]);
      const [e] = await tx.select().from(expenses).where(eq(expenses.amount, 64_500));
      expect(e).toMatchObject({ setId: set.id, description: "Maize, 100 kg · Ogige market" });
    });
  });

  it("lets managers change or retire a feed; retired feeds leave the daily log's list", async () => {
    await withApi(async (tx) => {
      const { finisher } = await farm(tx);
      expect((await call(editType, { method: "PATCH", params: { id: finisher.id }, body: { active: false } })).body.active).toBe(false);
      expect((await call(listTypes)).body.find((t: { id: string }) => t.id === finisher.id)).toBeUndefined();
      expect((await call(listTypes, { query: "?all=1" })).body.find((t: { id: string }) => t.id === finisher.id)).toBeDefined();
      expect(await tx.select().from(auditEvents).where(eq(auditEvents.rowId, finisher.id))).toHaveLength(2);
    });
  });
});
