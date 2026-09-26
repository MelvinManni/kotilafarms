// Every naira that moved, as dated lines: sales money received, capital, loans in; expenses, withdrawals, loan repayments out
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { capitalEntries, expenseCategories, expenses, loans, otherSales, salePayments, sales, shareholders } from "@/db/schema";
import type { CashLine } from "@/utils/metrics/cash-since";
import { loanInterest } from "@/utils/metrics/loans";
import { queries } from "@/server/queries";

const SALES = "Bird and manure sales";
const iso = (d: Date) => d.toISOString();

export async function cashLines(db: Executor): Promise<{ moneyIn: CashLine[]; moneyOut: CashLine[] }> {
  const [saleRows, payments, other, spent, capital, loanRows] = await queries(db, [
    () => db.select({ date: sales.date, deposit: sales.deposit, paidAtSale: sales.paidAtSale, at: sales.createdAt }).from(sales).where(isNull(sales.deletedAt)),
    () => db.select({ date: salePayments.date, amount: salePayments.amount, at: salePayments.createdAt }).from(salePayments).innerJoin(sales, eq(sales.id, salePayments.saleId)).where(and(isNull(salePayments.deletedAt), isNull(sales.deletedAt))),
    () => db.select({ date: otherSales.date, amount: otherSales.amount, at: otherSales.createdAt }).from(otherSales).where(isNull(otherSales.deletedAt)),
    () => db.select({ date: expenses.date, amount: expenses.amount, group: expenseCategories.name, at: expenses.createdAt }).from(expenses).innerJoin(expenseCategories, eq(expenseCategories.id, expenses.categoryId)).where(isNull(expenses.deletedAt)),
    () => db.select({ date: capitalEntries.date, amount: capitalEntries.amount, name: shareholders.name, at: capitalEntries.createdAt }).from(capitalEntries).innerJoin(shareholders, eq(shareholders.id, capitalEntries.shareholderId)).where(isNull(capitalEntries.deletedAt)),
    () => db.select({ l: loans, name: shareholders.name }).from(loans).innerJoin(shareholders, eq(shareholders.id, loans.lenderShareholderId)).where(isNull(loans.deletedAt)),
  ]);
  const moneyIn: CashLine[] = [
    ...saleRows.map((s) => ({ date: s.date, amount: s.deposit + s.paidAtSale, group: SALES, enteredAt: iso(s.at) })),
    ...payments.map((p) => ({ date: p.date, amount: p.amount, group: SALES, enteredAt: iso(p.at) })),
    ...other.map((o) => ({ date: o.date, amount: o.amount, group: SALES, enteredAt: iso(o.at) })),
    ...capital.filter((c) => c.amount > 0).map((c) => ({ date: c.date, amount: c.amount, group: `Partner capital from ${c.name}`, enteredAt: iso(c.at) })),
    ...loanRows.map(({ l, name }) => ({ date: l.advancedOn, amount: l.amount, group: `Shareholder loan from ${name}`, enteredAt: iso(l.createdAt) })),
  ];
  const moneyOut: CashLine[] = [
    ...spent.map((e) => ({ date: e.date, amount: e.amount, group: e.group, enteredAt: iso(e.at) })),
    ...capital.filter((c) => c.amount < 0).map((c) => ({ date: c.date, amount: -c.amount, group: `Withdrawn by ${c.name}`, enteredAt: iso(c.at) })),
    // Repaying a loan pays back the amount plus gross interest (net to the lender, tax to the government)
    ...loanRows.filter(({ l }) => l.repaidOn).map(({ l, name }) => ({ date: l.repaidOn!, amount: l.amount + loanInterest(l.amount, l.advancedOn, l.repaidOn!, l.rate, l.whtRate).gross, group: `Loan repaid to ${name}`, enteredAt: iso(l.updatedAt) })),
  ];
  return { moneyIn, moneyOut };
}

