// Shareholders, their capital and loans, and cash reconciliations
import { integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { commonColumns } from "@/db/schema/_common";
import { eventTime, farmDay, money } from "@/db/schema/_columns";

export const shareholders = pgTable("shareholders", {
  ...commonColumns("shareholders"),
  name: text().notNull(),
  shares: integer().notNull(),
  // Removed from the register: money stays in the books, shares stop counting
  removedAt: eventTime(),
});

// + contributed, − withdrawn
export const capitalEntries = pgTable("capital_entries", {
  ...commonColumns("capital_entries"),
  shareholderId: uuid()
    .notNull()
    .references(() => shareholders.id),
  date: farmDay().notNull(),
  amount: money().notNull(),
  note: text(),
});

export const loans = pgTable("loans", {
  ...commonColumns("loans"),
  lenderShareholderId: uuid()
    .notNull()
    .references(() => shareholders.id),
  amount: money().notNull(),
  advancedOn: farmDay().notNull(),
  repaidOn: farmDay(),
  rate: numeric({ precision: 5, scale: 4, mode: "number" }).notNull().default(0.16),
  whtRate: numeric({ precision: 5, scale: 4, mode: "number" }).notNull().default(0.1),
});

export const cashReconciliations = pgTable("cash_reconciliations", {
  ...commonColumns("cash_reconciliations"),
  date: farmDay().notNull(),
  countedCash: money().notNull(),
  bankBalance: money().notNull(),
  expected: money().notNull(),
  difference: money().notNull(),
  note: text(),
});
