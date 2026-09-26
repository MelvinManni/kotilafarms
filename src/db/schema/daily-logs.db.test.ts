// One live daily log per Set per day; counts and tags are checked by the database
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { dailyLogConflicts, dailyLogs } from "@/db/schema";
import { farmWithSet, made } from "@test/db/factories";
import { expectConstraint, inRollback } from "@test/db/test-db";

describe("daily logs", () => {
  it("refuses a second live log for the same Set and day", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      await tx.insert(dailyLogs).values({ ...made(ownerId), setId: set.id, date: "2026-09-25", deaths: 1 });
      await expectConstraint(tx, "daily_logs_set_date_live", (sp) =>
        sp.insert(dailyLogs).values({ ...made(ownerId), setId: set.id, date: "2026-09-25", deaths: 0 }),
      );
    });
  });

  it("allows a new log once the old one is deleted", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      const [old] = await tx.insert(dailyLogs).values({ ...made(ownerId), setId: set.id, date: "2026-09-25", deaths: 1 }).returning();
      await tx.update(dailyLogs).set({ deletedAt: new Date() }).where(eq(dailyLogs.id, old!.id));
      const [fresh] = await tx.insert(dailyLogs).values({ ...made(ownerId), setId: set.id, date: "2026-09-25", deaths: 2 }).returning();
      expect(fresh!.deaths).toBe(2);
    });
  });

  it("refuses negative deaths and unknown tags", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      await expectConstraint(tx, "daily_logs_deaths_not_negative", (sp) =>
        sp.insert(dailyLogs).values({ ...made(ownerId), setId: set.id, date: "2026-09-24", deaths: -1 }),
      );
      await expectConstraint(tx, "daily_logs_known_tags", (sp) =>
        sp.insert(dailyLogs).values({ ...made(ownerId), setId: set.id, date: "2026-09-24", deaths: 0, tags: ["sneezing"] }),
      );
    });
  });

  it("keeps known tags and decimal feed", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set, feedTypeId } = await farmWithSet(tx);
      const [row] = await tx
        .insert(dailyLogs)
        .values({ ...made(ownerId), setId: set.id, date: "2026-09-24", deaths: 0, feedTypeId, feedQty: 2.3, tags: ["wet_litter", "coughing"] })
        .returning();
      expect(row!.feedQty).toBe(2.3);
      expect(row!.tags).toEqual(["wet_litter", "coughing"]);
      expect(row!.version).toBe(1);
    });
  });

  it("records one conflict per sync request", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      const [log] = await tx.insert(dailyLogs).values({ ...made(ownerId), setId: set.id, date: "2026-09-25", deaths: 1 }).returning();
      const conflict = { setId: set.id, date: "2026-09-25", incoming: { deaths: 3 }, existingId: log!.id, mutationId: crypto.randomUUID(), raisedBy: ownerId };
      await tx.insert(dailyLogConflicts).values(conflict);
      await expectConstraint(tx, "daily_log_conflicts_mutation_id_unique", (sp) => sp.insert(dailyLogConflicts).values(conflict));
    });
  });
});
