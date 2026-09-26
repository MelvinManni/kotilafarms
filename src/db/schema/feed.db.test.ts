// A feed purchase needs bags, price per bag and total, and they must agree
import { describe, expect, it } from "vitest";
import { expenses, feedPurchases } from "@/db/schema";
import { farmWithSet, made } from "@test/db/factories";
import { expectConstraint, inRollback } from "@test/db/test-db";

describe("feed purchases", () => {
  it("saves a purchase linked to its Feed expense, and refuses a second link to that expense", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set, feedTypeId, categoryId } = await farmWithSet(tx);
      const [expense] = await tx
        .insert(expenses)
        .values({ ...made(ownerId), date: "2026-09-22", categoryId: await categoryId("feed"), description: "20 bags finisher", amount: 496_000, setId: set.id })
        .returning();
      const purchase = { date: "2026-09-22", feedTypeId, bags: 20, kgPerBag: 25, pricePerBag: 24_800, total: 496_000, supplier: "Agro Hub", expenseId: expense!.id };
      const [row] = await tx.insert(feedPurchases).values({ ...made(ownerId), ...purchase }).returning();
      expect(row!.bags).toBe(20);
      await expectConstraint(tx, "feed_purchases_expense_id_unique", (sp) => sp.insert(feedPurchases).values({ ...made(ownerId), ...purchase }));
    });
  });

  it("refuses totals that don't match bags × price, and empty bag counts", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set, feedTypeId, categoryId } = await farmWithSet(tx);
      const [expense] = await tx
        .insert(expenses)
        .values({ ...made(ownerId), date: "2026-09-22", categoryId: await categoryId("feed"), description: "Feed", amount: 1, setId: set.id })
        .returning();
      const base = { date: "2026-09-22", feedTypeId, kgPerBag: 25, supplier: "Agro Hub", expenseId: expense!.id };
      await expectConstraint(tx, "feed_purchases_amounts_agree", (sp) =>
        sp.insert(feedPurchases).values({ ...made(ownerId), ...base, bags: 20, pricePerBag: 24_800, total: 400_000 }),
      );
      await expectConstraint(tx, "feed_purchases_bags_positive", (sp) =>
        sp.insert(feedPurchases).values({ ...made(ownerId), ...base, bags: 0, pricePerBag: 24_800, total: 0 }),
      );
    });
  });
});
