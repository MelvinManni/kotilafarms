// Buyers, bird sales with payments, and manure sales
import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { commonColumns } from "@/db/schema/_common";
import { farmDay, money } from "@/db/schema/_columns";
import { otherSaleKindEnum, paymentMethodEnum } from "@/db/schema/enums";
import { sets } from "@/db/schema/sets";

export const buyers = pgTable("buyers", {
  ...commonColumns("buyers"),
  name: text().notNull(),
  phone: text(),
  note: text(),
});

// Balance = total − deposit − paid at sale − payments since
export const sales = pgTable(
  "sales",
  {
    ...commonColumns("sales"),
    setId: uuid()
      .notNull()
      .references(() => sets.id),
    date: farmDay().notNull(),
    buyerId: uuid()
      .notNull()
      .references(() => buyers.id),
    birds: integer().notNull(),
    pricePerBird: money().notNull(),
    total: money().notNull(),
    paidAtSale: money().notNull(),
    deposit: money().notNull().default(0),
    method: paymentMethodEnum().notNull(),
    note: text(),
  },
  (t) => [
    index("sales_set").on(t.setId),
    index("sales_buyer").on(t.buyerId),
    check("sales_birds_positive", sql`${t.birds} > 0`),
    // Birds × price = total, allowing for rounding when the price was worked out from the total
    check("sales_amounts_agree", sql`abs(${t.total} - ${t.birds} * ${t.pricePerBird}) * 2 <= greatest(${t.birds}, 2)`),
    check("sales_not_overpaid", sql`${t.deposit} + ${t.paidAtSale} <= ${t.total}`),
  ],
);

export const salePayments = pgTable(
  "sale_payments",
  {
    ...commonColumns("sale_payments"),
    saleId: uuid()
      .notNull()
      .references(() => sales.id),
    date: farmDay().notNull(),
    amount: money().notNull(),
    method: paymentMethodEnum().notNull(),
  },
  (t) => [index("sale_payments_sale").on(t.saleId), check("sale_payments_positive", sql`${t.amount} > 0`)],
);

export const otherSales = pgTable("other_sales", {
  ...commonColumns("other_sales"),
  setId: uuid()
    .notNull()
    .references(() => sets.id),
  date: farmDay().notNull(),
  kind: otherSaleKindEnum().notNull(),
  amount: money().notNull(),
});
