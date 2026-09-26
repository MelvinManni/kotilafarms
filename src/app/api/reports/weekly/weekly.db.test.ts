// Weekly review API: one note per running Set, from what was logged that week
import { describe, expect, it } from "vitest";
import { POST as log } from "@/app/api/sets/[id]/logs/route";
import { GET as weekly } from "@/app/api/reports/weekly/route";
import { signInAs } from "@test/api/state";
import { call, withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

describe("weekly review API", () => {
  it("writes points for a Set with trouble and one line for a quiet one", async () => {
    await withApi(async (tx) => {
      const { owner, manager } = await readyFarm(tx);
      const busy = await makeSet(tx, owner);
      const quiet = await makeSet(tx, owner, { startDate: "2026-09-20", intake: 600, pen: "Front pen" });
      signInAs(manager);
      for (const date of ["2026-09-20", "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24"]) await call(log, { method: "POST", params: { id: busy.id }, body: { clientId: crypto.randomUUID(), date, deaths: 0, tags: ["wet_litter"] } });
      for (const date of ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26"]) await call(log, { method: "POST", params: { id: quiet.id }, body: { clientId: crypto.randomUUID(), date, deaths: 0 } });
      const { body } = await call(weekly, { query: "?week=2026-09-23" });
      expect(body.week).toEqual({ start: "2026-09-20", end: "2026-09-26" });
      const [q, b] = body.sets;
      expect(b.review.title).toBe(`Set ${busy.number}: vaccines are late and wet litter keeps coming back`);
      expect(b.review.points[0].text).toBe("Gumboro 1st dose, Lasota 1st dose, Gumboro 2nd dose and Lasota 2nd dose are late.");
      expect(b.review.points.map((p: { text: string }) => p.text)).toContain("No daily log for Friday and Saturday.");
      expect(q.review).toMatchObject({ title: `Set ${quiet.number}: nothing to worry about this week.`, points: [] });
      expect(q.review.allWell).toContain("Gumboro 1st dose is due tomorrow.");
      expect((await call(weekly, { query: "?week=2026-08-01" })).body.sets).toEqual([]);
    });
  });
});
