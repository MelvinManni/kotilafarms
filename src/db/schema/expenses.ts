// Every naira out: one Set or farm overhead, never neither, never both
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { commonColumns } from "@/db/schema/_common";
import { farmDay, money } from "@/db/schema/_columns";
import { sets } from "@/db/schema/sets";
import { users } from "@/db/schema/users";

export const expenseCategories = pgTable("expense_categories", {
  ...commonColumns("expense_categories"),
  key: text().notNull().unique(),
  name: text().notNull(),
  isCapitalEligible: boolean().notNull().default(false),
});

export const expenses = pgTable(
  "expenses",
  {
    ...commonColumns("expenses"),
    date: farmDay().notNull(),
    categoryId: uuid()
      .notNull()
      .references(() => expenseCategories.id),
    description: text().notNull(),
    amount: money().notNull(),
    setId: uuid().references(() => sets.id),
    overhead: boolean().notNull().default(false),
    paidByUserId: uuid().references(() => users.id),
    // S3 object key, never a public URL
    receiptKey: text(),
    capitalItem: boolean().notNull().default(false),
    spreadOverSets: integer(),
    // Set when another device saved what looks like the same expense
    possibleDuplicateOf: uuid(),
  },
  (t) => [
    index("expenses_date").on(t.date),
    index("expenses_set").on(t.setId),
    check("expenses_set_or_overhead", sql`(${t.setId} is not null) <> ${t.overhead}`),
    check("expenses_amount_positive", sql`${t.amount} > 0`),
  ],
);
