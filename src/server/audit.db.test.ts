// The audit trail writes one row per changed field and skips bookkeeping columns
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { auditEvents } from "@/db/schema";
import { recordChange, recordCreate } from "@/server/audit";
import { farmWithSet } from "@test/db/factories";
import { inRollback } from "@test/db/test-db";

describe("audit trail", () => {
  it("records each changed field with the reason", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      await recordCreate(tx, "daily_logs", set.id, { userId: ownerId });
      const n = await recordChange(tx, {
        table: "daily_logs",
        rowId: set.id,
        before: { deaths: 0, note: null, version: 1, updatedAt: "a" },
        after: { deaths: 1, note: "Found by the drinkers", version: 2, updatedAt: "b" },
        reason: "Counted again in the morning",
        userId: ownerId,
      });
      expect(n).toBe(2);
      const rows = await tx.select().from(auditEvents).where(eq(auditEvents.rowId, set.id));
      expect(rows.map((r) => [r.action, r.field, r.oldValue, r.newValue])).toEqual([
        ["create", null, null, null],
        ["update", "deaths", 0, 1],
        ["update", "note", null, "Found by the drinkers"],
      ]);
      expect(rows[1]!.reason).toBe("Counted again in the morning");
    });
  });

  it("records a soft delete as a delete", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      await recordChange(tx, { table: "sets", rowId: set.id, before: { deletedAt: null }, after: { deletedAt: "2026-09-26T10:00:00Z" }, userId: ownerId });
      const [row] = await tx.select().from(auditEvents).where(eq(auditEvents.rowId, set.id));
      expect(row!.action).toBe("delete");
    });
  });
});
