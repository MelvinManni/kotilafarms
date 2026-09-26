// Set report API: Set 3 end to end — money, FCR 1.74, ₦1,806 feed per kg, growth, largest expenses, unpaid
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET as report } from "@/app/api/reports/set/route";
import { POST as log } from "@/app/api/sets/[id]/logs/route";
import { POST as weigh } from "@/app/api/sets/[id]/weights/route";
import { POST as addType } from "@/app/api/feed/types/route";
import { sets } from "@/db/schema";
import { set3 } from "@test/api/set3";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";

describe("Set report API", () => {
  it("puts Set 3 together", async () => {
    await withApi(async (tx) => {
      const { set, recorder, manager } = await set3(tx);
      const finisher = (await call(addType, { method: "POST", body: { kind: "finisher", brand: "Ultima", kgPerBag: 25 } })).body;
      signInAs(recorder);
      await call(log, { method: "POST", params: { id: set.id }, body: { clientId: crypto.randomUUID(), date: "2026-08-30", deaths: 35, feedTypeId: finisher.id, feedQty: 79.6, feedUnit: "bags" } });
      await call(weigh, { method: "POST", params: { id: set.id }, body: { clientId: crypto.randomUUID(), date: "2026-08-31", weightsGrams: [2_400, 2_520] } });
      await tx.update(sets).set({ status: "closed", closedOn: "2026-09-14" }).where(eq(sets.id, set.id));
      signInAs(manager);
      const { body } = await call(report, { query: `?setIds=${set.id}` });
      expect(body).toMatchObject({ deaths: 35, liveBirds: 0, birdsSold: 465, period: { from: "2026-07-20", to: "2026-09-14" }, saleWeight: { averageGrams: 2_460, day: 42 } });
      expect(body.pnl).toMatchObject({ profit: 568_750, costPerBirdSold: 6_440 });
      expect(body.performance.fcr.toFixed(2)).toBe("1.74");
      expect(body.performance.feedCostPerKg).toBe(1_806);
      expect(body.growth.samples).toEqual([{ day: 42, grams: 2_460 }]);
      expect(body.largestExpenses.of).toBe(9);
      expect(body.largestExpenses.rows).toHaveLength(7);
      expect(body.largestExpenses.rows.map((r: { amount: number }) => r.amount)).toContain(2_066_412);
      expect(body.unpaid).toEqual({ count: 0, total: 0 });
      signInAs(recorder);
      expect((await call(report, { query: `?setIds=${set.id}` })).status).toBe(403);
    });
  });
});
