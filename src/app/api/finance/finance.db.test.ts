// Finance API: Set 3's profit and loss reproduced end to end, cash position, and a cash count
import { describe, expect, it } from "vitest";
import { GET as cash } from "@/app/api/finance/cash/route";
import { GET as pnl } from "@/app/api/finance/pnl/route";
import { GET as counts, POST as count } from "@/app/api/finance/reconciliations/route";
import { signInAs } from "@test/api/state";
import { set3 } from "@test/api/set3";
import { call, withApi } from "@test/api/with-api";

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
