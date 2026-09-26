// Duplicate backstops: a record's clientId and a request's mutationId can each be used once
import { describe, it } from "vitest";
import { devices, expenses, syncMutations } from "@/db/schema";
import { farmWithSet, made } from "@test/db/factories";
import { expectConstraint, inRollback } from "@test/db/test-db";

describe("sync duplicate backstops", () => {
  it("refuses a second record with the same clientId", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set, categoryId } = await farmWithSet(tx);
      const row = { ...made(ownerId), date: "2026-09-26", categoryId: await categoryId("other"), description: "Diesel", amount: 12_000, setId: set.id };
      await tx.insert(expenses).values(row);
      await expectConstraint(tx, "expenses_client_id_unique", (sp) => sp.insert(expenses).values(row));
    });
  });

  it("refuses to record the same mutation twice", async () => {
    await inRollback(async (tx) => {
      const { ownerId } = await farmWithSet(tx);
      const deviceId = crypto.randomUUID();
      await tx.insert(devices).values({ id: deviceId, userId: ownerId });
      const mutation = { mutationId: crypto.randomUUID(), deviceId, userId: ownerId, type: "expense.create", payloadHash: "abc", status: "applied" as const, result: {} };
      await tx.insert(syncMutations).values(mutation);
      await expectConstraint(tx, "sync_mutations_pkey", (sp) => sp.insert(syncMutations).values(mutation));
    });
  });
});
