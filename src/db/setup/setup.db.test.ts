// db:setup makes one owner and the fixed lists, and is safe to run twice
import { count, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { breedCurves, expenseCategories, settings, stockTypes, users, vaccineScheduleDefaults } from "@/db/schema";
import { createFirstOwner } from "@/db/setup/create-first-owner";
import { insertReferenceData } from "@/db/setup/insert-reference-data";
import { hashPassword, verifyPassword } from "@/server/password";
import { inRollback } from "@test/db/test-db";

const owner = { name: "Kosi", email: "Kosi@Example.com", passwordHash: "" };

describe("db setup", () => {
  it("starts from a blank database", async () => {
    await inRollback(async (tx) => {
      const [people] = await tx.select({ n: count() }).from(users);
      expect(people!.n).toBe(0);
    });
  });

  it("makes the first owner once, with a lowercased email and a working password", async () => {
    await inRollback(async (tx) => {
      const passwordHash = await hashPassword("change-me-now-please");
      const first = await createFirstOwner(tx, { ...owner, passwordHash });
      const again = await createFirstOwner(tx, { ...owner, email: "someone@else.com", passwordHash });
      expect(first.created).toBe(true);
      expect(again).toEqual({ id: first.id, created: false });
      const [row] = await tx.select().from(users).where(eq(users.id, first.id));
      expect(row!.email).toBe("kosi@example.com");
      expect(row!.role).toBe("owner");
      expect(await verifyPassword(row!.passwordHash, "change-me-now-please")).toBe(true);
      expect(await verifyPassword(row!.passwordHash, "wrong-password")).toBe(false);
    });
  });

  it("adds the spec's lists and adds nothing the second time", async () => {
    await inRollback(async (tx) => {
      const { id } = await createFirstOwner(tx, { ...owner, passwordHash: "x" });
      await insertReferenceData(tx, id);
      await insertReferenceData(tx, id);
      const n = async (table: PgTable) => (await tx.select({ n: count() }).from(table))[0]!.n;
      expect(await n(expenseCategories)).toBe(10);
      expect(await n(stockTypes)).toBe(1);
      expect(await n(vaccineScheduleDefaults)).toBe(4);
      expect(await n(breedCurves)).toBe(1);
      expect(await n(settings)).toBe(3);
    });
  });
});
