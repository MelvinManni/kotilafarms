// Sets (a group of birds raised together), their stock type and breed standard curve
import { integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { commonColumns } from "@/db/schema/_common";
import { farmDay, money } from "@/db/schema/_columns";
import { setStatusEnum } from "@/db/schema/enums";

export const stockTypes = pgTable("stock_types", {
  ...commonColumns("stock_types"),
  key: text().notNull().unique(),
  name: text().notNull(),
});

export type CurvePointGrams = { day: number; grams: number };

export const breedCurves = pgTable("breed_curves", {
  ...commonColumns("breed_curves"),
  name: text().notNull(),
  points: jsonb().$type<CurvePointGrams[]>().notNull(),
});

export const sets = pgTable("sets", {
  ...commonColumns("sets"),
  // Set 1, Set 2 … in order of starting
  number: integer().notNull().unique().generatedByDefaultAsIdentity(),
  name: text(),
  stockTypeId: uuid()
    .notNull()
    .references(() => stockTypes.id),
  pen: text(),
  status: setStatusEnum().notNull().default("brooding"),
  startDate: farmDay().notNull(),
  intake: integer().notNull(),
  dayOldSupplier: text().notNull(),
  dayOldUnitCost: money().notNull(),
  breedCurveId: uuid()
    .notNull()
    .references(() => breedCurves.id),
  closedOn: farmDay(),
});
