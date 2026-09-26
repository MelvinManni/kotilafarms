// Compare API: Set 3 (closed) against a running Set, and at least two Sets
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET as compare } from "@/app/api/reports/compare/route";
import { sets } from "@/db/schema";
import { set3 } from "@test/api/set3";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { makeSet } from "@test/db/sets";

describe("compare API", () => {
  it("lines up a closed Set and a running one; money only for the closed", async () => {
    await withApi(async (tx) => {
      const { set, owner, manager, recorder } = await set3(tx);
      await tx.update(sets).set({ status: "closed", closedOn: "2026-09-14" }).where(eq(sets.id, set.id));
      const running = await makeSet(tx, owner, { startDate: "2026-09-20", intake: 600 });
      signInAs(manager);
      const { body } = await call(compare, { query: `?setIds=${set.id},${running.id}` });
      expect(body[0]).toMatchObject({ number: set.number, closed: true, sold: 465, profit: 568_750, costPerBirdSold: 6_440, revenuePerBird: 7_629 });
      expect(body[0].margin).toBeCloseTo(0.1596, 4);
      expect(body[1]).toMatchObject({ number: running.number, closed: false, dayOfAge: 6, profit: null, margin: null, costPerBirdSold: null });
      expect((await call(compare, { query: `?setIds=${set.id}` })).body.error.issues[0].message).toBe("Pick at least two Sets to compare.");
      signInAs(recorder);
      expect((await call(compare, { query: `?setIds=${set.id},${running.id}` })).status).toBe(403);
    });
  });
});
