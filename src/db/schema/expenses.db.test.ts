// Every naira out belongs to one Set or farm overhead — enforced by the database
import { describe, expect, it } from "vitest";
import { expenses } from "@/db/schema";
import { farmWithSet, made } from "@test/db/factories";
import { expectConstraint, inRollback } from "@test/db/test-db";

describe("expenses", () => {
  it("saves a Set expense and an overhead expense", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set, categoryId } = await farmWithSet(tx);
      const base = { date: "2026-09-26", categoryId: await categoryId("other"), description: "Diesel", amount: 12_000 };
      const rows = await tx
        .insert(expenses)
        .values([
          { ...made(ownerId), ...base, setId: set.id },
          { ...made(ownerId), ...base, overhead: true },
        ])
        .returning();
      expect(rows).toHaveLength(2);
    });
  });

  it("refuses an expense with neither a Set nor overhead", async () => {
    await inRollback(async (tx) => {
      const { ownerId, categoryId } = await farmWithSet(tx);
      const base = { date: "2026-09-26", categoryId: await categoryId("other"), description: "Diesel", amount: 12_000 };
      await expectConstraint(tx, "expenses_set_or_overhead", (sp) => sp.insert(expenses).values({ ...made(ownerId), ...base }));
    });
  });

  it("refuses an expense with both a Set and overhead", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set, categoryId } = await farmWithSet(tx);
      const base = { date: "2026-09-26", categoryId: await categoryId("other"), description: "Diesel", amount: 12_000 };
      await expectConstraint(tx, "expenses_set_or_overhead", (sp) =>
        sp.insert(expenses).values({ ...made(ownerId), ...base, setId: set.id, overhead: true }),
      );
    });
  });

  it("refuses zero or negative amounts", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set, categoryId } = await farmWithSet(tx);
      const base = { date: "2026-09-26", categoryId: await categoryId("other"), description: "Diesel", setId: set.id };
      await expectConstraint(tx, "expenses_amount_positive", (sp) => sp.insert(expenses).values({ ...made(ownerId), ...base, amount: 0 }));
    });
  });
});
