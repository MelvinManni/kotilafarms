// Feed types, feed purchases and raw ingredient purchases; the money side of each is an expense row
import { sql } from "drizzle-orm";
import { boolean, check, index, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { commonColumns } from "@/db/schema/_common";
import { farmDay, money } from "@/db/schema/_columns";
import { feedKindEnum } from "@/db/schema/enums";
import { expenses } from "@/db/schema/expenses";
import { sets } from "@/db/schema/sets";

export const feedTypes = pgTable("feed_types", {
  ...commonColumns("feed_types"),
  kind: feedKindEnum().notNull(),
  brand: text().notNull(),
  kgPerBag: numeric({ precision: 6, scale: 2, mode: "number" }).notNull().default(25),
  active: boolean().notNull().default(true),
});

export const feedPurchases = pgTable(
  "feed_purchases",
  {
    ...commonColumns("feed_purchases"),
    date: farmDay().notNull(),
    feedTypeId: uuid()
      .notNull()
      .references(() => feedTypes.id),
    bags: numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
    kgPerBag: numeric({ precision: 6, scale: 2, mode: "number" }).notNull(),
    pricePerBag: money().notNull(),
    total: money().notNull(),
    transportCost: money().notNull().default(0),
    supplier: text().notNull(),
    // The Feed expense for `total`; Set or overhead lives there
    expenseId: uuid()
      .notNull()
      .unique("feed_purchases_expense_id_unique")
      .references(() => expenses.id),
    // The Transport expense, when transport was paid
    transportExpenseId: uuid()
      .unique("feed_purchases_transport_expense_id_unique")
      .references(() => expenses.id),
  },
  (t) => [
    index("feed_purchases_type_date").on(t.feedTypeId, t.date),
    check("feed_purchases_bags_positive", sql`${t.bags} > 0`),
    // Bags × price per bag = total, allowing for rounding whichever one was worked out
    check(
      "feed_purchases_amounts_agree",
      sql`abs(${t.total} - ${t.bags} * ${t.pricePerBag}) <= greatest(1, ${t.bags} / 2, ${t.pricePerBag} * 0.005)`,
    ),
  ],
);

export const ingredientPurchases = pgTable("ingredient_purchases", {
  ...commonColumns("ingredient_purchases"),
  date: farmDay().notNull(),
  setId: uuid()
    .notNull()
    .references(() => sets.id),
  ingredient: text().notNull(),
  quantity: numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
  unit: text().notNull(),
  unitCost: money().notNull(),
  total: money().notNull(),
  expenseId: uuid()
    .notNull()
    .unique("ingredient_purchases_expense_id_unique")
    .references(() => expenses.id),
});
