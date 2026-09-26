// Emails are unique whatever their case; Sets number themselves in order; weight samples need weights
import { describe, expect, it } from "vitest";
import { sets, users, weightSamples } from "@/db/schema";
import { farmWithSet, made } from "@test/db/factories";
import { expectConstraint, inRollback } from "@test/db/test-db";

describe("users, sets and weights", () => {
  it("refuses the same email in a different case", async () => {
    await inRollback(async (tx) => {
      await tx.insert(users).values({ name: "Adaeze", email: "adaeze@example.com", passwordHash: "x", role: "manager" });
      await expectConstraint(tx, "users_email_unique", (sp) =>
        sp.insert(users).values({ name: "Adaeze", email: "ADAEZE@example.com", passwordHash: "x", role: "manager" }),
      );
    });
  });

  it("numbers Sets one after another", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      const [next] = await tx
        .insert(sets)
        .values({ ...made(ownerId), stockTypeId: set.stockTypeId, breedCurveId: set.breedCurveId, startDate: "2026-09-20", intake: 600, dayOldSupplier: "Zartech", dayOldUnitCost: 980 })
        .returning();
      expect(next!.number).toBe(set.number + 1);
      expect(next!.status).toBe("brooding");
    });
  });

  it("refuses a weight sample with no weights", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      await expectConstraint(tx, "weight_samples_has_weights", (sp) =>
        sp.insert(weightSamples).values({ ...made(ownerId), setId: set.id, date: "2026-09-26", ageDays: 24, weightsGrams: [] }),
      );
    });
  });
});
