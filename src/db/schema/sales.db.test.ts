// Birds × price = total (allowing a worked-out price), and a sale can't be overpaid
import { describe, expect, it } from "vitest";
import { buyers, sales } from "@/db/schema";
import { farmWithSet, made } from "@test/db/factories";
import { expectConstraint, inRollback } from "@test/db/test-db";

async function farmWithBuyer(tx: Parameters<Parameters<typeof inRollback>[0]>[0]) {
  const farm = await farmWithSet(tx);
  const [buyer] = await tx.insert(buyers).values({ ...made(farm.ownerId), name: "Alhaji Sule" }).returning();
  const sale = (over: Partial<typeof sales.$inferInsert>) => ({
    ...made(farm.ownerId),
    setId: farm.set.id,
    buyerId: buyer!.id,
    date: "2026-09-10",
    method: "transfer" as const,
    birds: 50,
    pricePerBird: 7_171,
    total: 358_550,
    paidAtSale: 304_950,
    ...over,
  });
  return { sale };
}

describe("sales", () => {
  it("saves an exact sale with a balance owed", async () => {
    await inRollback(async (tx) => {
      const { sale } = await farmWithBuyer(tx);
      const [row] = await tx.insert(sales).values(sale({})).returning();
      expect(row!.total - row!.paidAtSale - row!.deposit).toBe(53_600);
    });
  });

  it("accepts a price worked out from the total (465 birds for ₦3,563,550 → ₦7,664)", async () => {
    await inRollback(async (tx) => {
      const { sale } = await farmWithBuyer(tx);
      const rows = await tx.insert(sales).values(sale({ birds: 465, total: 3_563_550, pricePerBird: 7_664, paidAtSale: 0 })).returning();
      expect(rows).toHaveLength(1);
    });
  });

  it("refuses amounts that don't agree", async () => {
    await inRollback(async (tx) => {
      const { sale } = await farmWithBuyer(tx);
      await expectConstraint(tx, "sales_amounts_agree", (sp) => sp.insert(sales).values(sale({ pricePerBird: 7_500 })));
    });
  });

  it("refuses more paid than the total", async () => {
    await inRollback(async (tx) => {
      const { sale } = await farmWithBuyer(tx);
      await expectConstraint(tx, "sales_not_overpaid", (sp) => sp.insert(sales).values(sale({ paidAtSale: 300_000, deposit: 100_000 })));
    });
  });
});
