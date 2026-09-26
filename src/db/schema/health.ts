// Vaccine schedule (farm defaults and per Set) and drug or supplement records
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { commonColumns } from "@/db/schema/_common";
import { farmDay, money } from "@/db/schema/_columns";
import { expenses } from "@/db/schema/expenses";
import { sets } from "@/db/schema/sets";
import { users } from "@/db/schema/users";

export const vaccineScheduleDefaults = pgTable("vaccine_schedule_defaults", {
  ...commonColumns("vaccine_schedule_defaults"),
  item: text().notNull(),
  doseNo: integer().notNull(),
  dueAgeDays: integer().notNull(),
  method: text().notNull(),
});

export const setVaccines = pgTable("set_vaccines", {
  ...commonColumns("set_vaccines"),
  setId: uuid()
    .notNull()
    .references(() => sets.id),
  item: text().notNull(),
  doseNo: integer().notNull(),
  dueAgeDays: integer().notNull(),
  givenOn: farmDay(),
  givenBy: uuid().references(() => users.id),
  note: text(),
});

export const healthRecords = pgTable("health_records", {
  ...commonColumns("health_records"),
  setId: uuid()
    .notNull()
    .references(() => sets.id),
  date: farmDay().notNull(),
  item: text().notNull(),
  dose: text().notNull(),
  cost: money(),
  reason: text().notNull(),
  setVaccineId: uuid().references(() => setVaccines.id),
  // The Drugs and vaccines expense, when a cost was entered
  expenseId: uuid()
    .unique("health_records_expense_id_unique")
    .references(() => expenses.id),
});
