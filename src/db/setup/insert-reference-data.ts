// Add the spec's fixed lists; safe to run again (existing rows are left alone)
import { randomUUID } from "node:crypto";
import { count } from "drizzle-orm";
import type { Executor } from "@/db";
import { breedCurves, expenseCategories, settings, stockTypes, vaccineScheduleDefaults } from "@/db/schema";
import { BREED_CURVE, DEFAULT_SETTINGS, EXPENSE_CATEGORIES, STOCK_TYPES, VACCINE_DEFAULTS } from "@/db/setup/reference-data";

export async function insertReferenceData(db: Executor, ownerId: string) {
  const made = () => ({ clientId: randomUUID(), createdBy: ownerId });
  await db.insert(stockTypes).values(STOCK_TYPES.map((s) => ({ ...made(), ...s }))).onConflictDoNothing({ target: stockTypes.key });
  await db.insert(expenseCategories).values(EXPENSE_CATEGORIES.map((c) => ({ ...made(), ...c }))).onConflictDoNothing({ target: expenseCategories.key });
  await db
    .insert(settings)
    .values(Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value, updatedBy: ownerId })))
    .onConflictDoNothing({ target: settings.key });
  // These lists have no natural key: add them only to an empty table
  const [vaccines] = await db.select({ n: count() }).from(vaccineScheduleDefaults);
  if (vaccines!.n === 0) await db.insert(vaccineScheduleDefaults).values(VACCINE_DEFAULTS.map((v) => ({ ...made(), ...v })));
  const [curves] = await db.select({ n: count() }).from(breedCurves);
  if (curves!.n === 0) await db.insert(breedCurves).values({ ...made(), ...BREED_CURVE });
}
