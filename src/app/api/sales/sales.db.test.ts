// Sales API end to end: sales with balances, payments, outstanding list, manure, buyers, limits
import { describe, expect, it } from "vitest";
import { GET as buyerDetail } from "@/app/api/buyers/[id]/route";
import { GET as buyersList, POST as addBuyer } from "@/app/api/buyers/route";
import { POST as addManure } from "@/app/api/other-sales/route";
import { PATCH } from "@/app/api/sales/[id]/route";
import { POST as pay } from "@/app/api/sales/[id]/payments/route";
import { GET as owed } from "@/app/api/sales/outstanding/route";
import { GET, POST } from "@/app/api/sales/route";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

const id = () => crypto.randomUUID();

async function farm(tx: Parameters<Parameters<typeof withApi>[0]>[0]) {
  const people = await readyFarm(tx);
  const set = await makeSet(tx, people.owner, { startDate: "2026-07-20" });
  signInAs(people.manager);
  const buyer = async (name: string) => (await call(addBuyer, { method: "POST", body: { clientId: id(), name } })).body.id as string;
  const sale = (buyerId: string, over: Record<string, unknown> = {}) => ({
    clientId: id(), setId: set.id, buyerId, date: "2026-09-07", birds: 30, pricePerBird: 7_500, total: 225_000, paidAtSale: 10_000, method: "cash", ...over,
  });
  return { ...people, set, buyer, sale };
}

describe("sales API", () => {
  it("records sales with balances and lists what is owed, oldest first", async () => {
    await withApi(async (tx) => {
      const { buyer, sale } = await farm(tx);
      const nkechi = await buyer("Mama Nkechi");
      const sule = await buyer("Alhaji Sule");
      const first = await call(POST, { method: "POST", body: sale(nkechi) });
      expect(first.status).toBe(201);
      expect(first.body).toMatchObject({ balance: 215_000, paid: 10_000, daysOwed: 19, belowBulk: false });
      const second = await call(POST, { method: "POST", body: sale(sule, { date: "2026-09-10", birds: 50, pricePerBird: 7_171, total: 358_550, paidAtSale: 304_950, method: "transfer" }) });
      expect(second.body).toMatchObject({ balance: 53_600, belowBulk: true });
      const list = await call(owed);
      expect(list.body.rows.map((r: { buyer: { name: string } }) => r.buyer.name)).toEqual(["Mama Nkechi", "Alhaji Sule"]);
      expect(list.body.total).toEqual({ sales: 583_550, paid: 314_950, balance: 268_600 });
      expect(list.body.buyers).toBe(2);
    });
  });

  it("works out a price from the total and refuses amounts that don't agree", async () => {
    await withApi(async (tx) => {
      const { buyer, sale } = await farm(tx);
      const b = await buyer("Chidi Poultry Mart");
      expect((await call(POST, { method: "POST", body: sale(b, { birds: 81, total: 598_000, pricePerBird: 7_383, paidAtSale: 598_000 }) })).status).toBe(201);
      const bad = await call(POST, { method: "POST", body: sale(b, { birds: 20, total: 153_400, pricePerBird: 7_000 }) });
      expect(bad.body.error.message).toBe("Birds × price per bird doesn't match the total.");
      const overpaid = await call(POST, { method: "POST", body: sale(b, { paidAtSale: 230_000 }) });
      expect(overpaid.body.error.message).toBe("More is paid than the sale total.");
    });
  });

  it("never sells more birds than are alive", async () => {
    await withApi(async (tx) => {
      const { buyer, sale, set } = await farm(tx);
      const b = await buyer("Obinna Cold Room");
      const res = await call(POST, { method: "POST", body: sale(b, { birds: 501, total: 3_757_500, paidAtSale: 0 }) });
      expect(res.body.error.message).toBe(`Set ${set.number} has only 500 live birds on the books.`);
    });
  });

  it("takes payments up to the balance, once each", async () => {
    await withApi(async (tx) => {
      const { buyer, sale } = await farm(tx);
      const { body: s } = await call(POST, { method: "POST", body: sale(await buyer("Mama Nkechi")) });
      const payment = { clientId: id(), date: "2026-09-20", amount: 100_000, method: "transfer" };
      const paid = await call(pay, { method: "POST", params: { id: s.id }, body: payment });
      expect(paid.body).toMatchObject({ balance: 115_000, paid: 110_000 });
      expect((await call(pay, { method: "POST", params: { id: s.id }, body: payment })).body.balance).toBe(115_000);
      const tooMuch = await call(pay, { method: "POST", params: { id: s.id }, body: { ...payment, clientId: id(), amount: 200_000 } });
      expect(tooMuch.body.error.message).toBe("That's more than the ₦115,000 still owed.");
      await call(pay, { method: "POST", params: { id: s.id }, body: { ...payment, clientId: id(), amount: 115_000 } });
      expect((await call(owed)).body.rows).toHaveLength(0);
    });
  });

  it("needs a reason to change an old sale's money", async () => {
    await withApi(async (tx) => {
      const { buyer, sale } = await farm(tx);
      const { body: s } = await call(POST, { method: "POST", body: sale(await buyer("Iya Bisi")) });
      const noReason = await call(PATCH, { method: "PATCH", params: { id: s.id }, body: { paidAtSale: 20_000, baseVersion: 1 } });
      expect(noReason.body.error.message).toBe("Say why you're changing this sale after the day.");
      const ok = await call(PATCH, { method: "PATCH", params: { id: s.id }, body: { paidAtSale: 20_000, baseVersion: 1, reason: "Cash counted again" } });
      expect(ok.body).toMatchObject({ balance: 205_000, version: 2 });
    });
  });

  it("lists manure with the sales and sums buyers", async () => {
    await withApi(async (tx) => {
      const { buyer, sale, set } = await farm(tx);
      const nkechi = await buyer("Mama Nkechi");
      await call(POST, { method: "POST", body: sale(nkechi) });
      await call(addManure, { method: "POST", body: { clientId: id(), setId: set.id, date: "2026-09-14", amount: 15_900 } });
      const list = await call(GET, { query: `?setId=${set.id}` });
      expect(list.body.other).toEqual([expect.objectContaining({ kind: "manure", amount: 15_900 })]);
      expect(list.body.bulkRate).toBe(7_500);
      const [b] = (await call(buyersList)).body;
      expect(b).toMatchObject({ name: "Mama Nkechi", birds: 30, spent: 225_000, balance: 215_000, averagePrice: 7_500 });
      expect((await call(buyerDetail, { params: { id: nkechi } })).body.sales).toHaveLength(1);
      const dup = await call(addBuyer, { method: "POST", body: { clientId: id(), name: "Mama Nkechi" } });
      expect(dup.status).toBe(409);
    });
  });

  it("keeps sales from recorders", async () => {
    await withApi(async (tx) => {
      const { recorder } = await farm(tx);
      signInAs(recorder);
      expect((await call(GET)).status).toBe(403);
      expect((await call(owed)).status).toBe(403);
    });
  });
});
