// Start a Set: the Set, its vaccine schedule from the farm defaults, and the day-olds expense (one transaction)
import "server-only";
import { randomUUID } from "node:crypto";
import { eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { breedCurves, expenseCategories, expenses, sets, setVaccines, stockTypes, vaccineScheduleDefaults } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { unprocessable } from "@/server/errors";
import type { SetCreateInput } from "@/schemas/set";
import type { SessionUser } from "@/types/session";

export async function startSet(db: Executor, input: SetCreateInput, actor: SessionUser) {
  return db.transaction(async (tx) => {
    // Same clientId again (double tap, retry) returns the Set already made
    const [existing] = await tx.select().from(sets).where(eq(sets.clientId, input.clientId));
    if (existing) return { set: existing, created: false };
    const [stock] = await tx.select().from(stockTypes).where(eq(stockTypes.key, "broiler"));
    const [curve] = await tx.select().from(breedCurves).where(isNull(breedCurves.deletedAt)).limit(1);
    const [dayOlds] = await tx.select().from(expenseCategories).where(eq(expenseCategories.key, "day_olds"));
    if (!stock || !curve || !dayOlds) throw unprocessable("The farm lists aren't set up. Run pnpm db:setup.");
    const made = () => ({ clientId: randomUUID(), createdBy: actor.id });
    const [set] = await tx
      .insert(sets)
      .values({ ...input, name: input.name || null, clientId: input.clientId, createdBy: actor.id, stockTypeId: stock.id, breedCurveId: curve.id })
      .returning();
    const defaults = await tx.select().from(vaccineScheduleDefaults).where(isNull(vaccineScheduleDefaults.deletedAt));
    if (defaults.length) {
      await tx.insert(setVaccines).values(defaults.map((d) => ({ ...made(), setId: set!.id, item: d.item, doseNo: d.doseNo, dueAgeDays: d.dueAgeDays })));
    }
    const cost = input.intake * input.dayOldUnitCost;
    if (cost > 0) {
      await tx.insert(expenses).values({
        ...made(),
        date: input.startDate,
        categoryId: dayOlds.id,
        description: `${input.intake} day-olds from ${input.dayOldSupplier}`,
        amount: cost,
        setId: set!.id,
        paidByUserId: actor.id,
      });
    }
    await recordCreate(tx, "sets", set!.id, { userId: actor.id });
    return { set: set!, created: true };
  });
}
