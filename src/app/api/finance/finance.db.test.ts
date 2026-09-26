// Finance API: Set 3's profit and loss reproduced end to end, cash position, and a cash count
import { describe, expect, it } from "vitest";
import { GET as cash } from "@/app/api/finance/cash/route";
import { GET as pnl } from "@/app/api/finance/pnl/route";
import { GET as counts, POST as count } from "@/app/api/finance/reconciliations/route";
import { POST as addBuyer } from "@/app/api/buyers/route";
import { GET as categories } from "@/app/api/expense-categories/route";
import { POST as addExpense } from "@/app/api/expenses/route";
import { POST as addManure } from "@/app/api/other-sales/route";
import { POST as addSale } from "@/app/api/sales/route";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

type Tx = Parameters<Parameters<typeof withApi>[0]>[0];

// Set 3 (docs/12-seed-data.md): day-olds ₦445,000 come with the Set; the rest are expenses
const SET3_SPEND: [string, number][] = [["feed", 2_066_412], ["drugs", 131_600], ["brooding", 96_500], ["transport", 84_000], ["litter", 36_000], ["labour", 90_000], ["processing", 22_500], ["other", 22_788]];

async function set3(tx: Tx) {
  const people = await readyFarm(tx);
  const set = await makeSet(tx, people.owner, { startDate: "2026-07-20", intake: 500, dayOldUnitCost: 890 });
  signInAs(people.manager);
  const cats = (await call(categories)).body as { id: string; key: string }[];
  for (const [key, amount] of SET3_SPEND) await call(addExpense, { method: "POST", body: { clientId: crypto.randomUUID(), date: "2026-09-01", categoryId: cats.find((c) => c.key === key)!.id, description: key, amount, setId: set.id, overhead: false } });
  const buyer = (await call(addBuyer, { method: "POST", body: { clientId: crypto.randomUUID(), name: "Alhaji Sule" } })).body;
  await call(addSale, { method: "POST", body: { clientId: crypto.randomUUID(), setId: set.id, date: "2026-09-10", buyerId: buyer.id, birds: 465, pricePerBird: 7_629, total: 3_547_650, paidAtSale: 3_547_650, method: "transfer" } });
  await call(addManure, { method: "POST", body: { clientId: crypto.randomUUID(), setId: set.id, date: "2026-09-12", amount: 15_900 } });
  return { ...people, set };
}

describe("finance API", () => {
  it("reproduces Set 3: ₦568,750 profit, 15.96% margin, ₦6,440 a bird sold", async () => {
    await withApi(async (tx) => {
      const { set } = await set3(tx);
      const { body } = await call(pnl, { query: `?setIds=${set.id}` });
      expect(body.pnl).toMatchObject({ revenue: 3_563_550, expenses: 2_994_800, profit: 568_750, costPerBirdSold: 6_440, revenuePerBird: 7_629 });
      expect(body.pnl.margin).toBeCloseTo(0.1596, 4);
      expect(Math.round(body.feedShare * 100)).toBe(69);
      expect(body.byCategory[0]).toEqual({ label: "Feed", value: 2_066_412 });
      expect((await call(pnl, { query: "?setIds=" })).status).toBe(422);
    });
  });

  it("shows cash in and out, and a count resets the starting point", async () => {
    await withApi(async (tx) => {
      const { owner, manager } = await set3(tx);
      const before = (await call(cash)).body;
      expect(before).toMatchObject({ since: null, moneyIn: 3_563_550, moneyOut: 2_994_800, shouldBeOnHand: 568_750, owed: { total: 0, buyers: 0 } });
      expect(before.outRows[0]).toEqual({ label: "Feed", value: 2_066_412 });
      signInAs(manager);
      expect((await call(count, { method: "POST", body: { countedCash: 68_750, bankBalance: 500_000 } })).status).toBe(403);
      signInAs(owner);
      const done = await call(count, { method: "POST", body: { countedCash: 60_000, bankBalance: 500_000, note: "Box short" } });
      expect(done.body).toMatchObject({ expected: 568_750, difference: -8_750 });
      const after = (await call(cash)).body;
      expect(after).toMatchObject({ opening: 560_000, moneyIn: 0, moneyOut: 0, shouldBeOnHand: 560_000, since: { by: "Kosi", difference: -8_750 } });
      expect((await call(counts)).body).toHaveLength(1);
    });
  });
});
