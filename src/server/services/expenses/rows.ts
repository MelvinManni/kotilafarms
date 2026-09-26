// Read expenses with their category, Set number and people, as API rows
import "server-only";
import { and, desc, eq, gte, isNull, lt, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Executor } from "@/db";
import { expenseCategories, expenses, sets, users } from "@/db/schema";
import type { ExpenseRow } from "@/types/expense";

export async function expenseRows(db: Executor, where: SQL[]): Promise<ExpenseRow[]> {
  const payer = alias(users, "payer");
  const author = alias(users, "author");
  const rows = await db
    .select({ e: expenses, category: { id: expenseCategories.id, key: expenseCategories.key, name: expenseCategories.name }, setNumber: sets.number, payer: { id: payer.id, name: payer.name }, author: author.name })
    .from(expenses)
    .innerJoin(expenseCategories, eq(expenseCategories.id, expenses.categoryId))
    .innerJoin(author, eq(author.id, expenses.createdBy))
    .leftJoin(sets, eq(sets.id, expenses.setId))
    .leftJoin(payer, eq(payer.id, expenses.paidByUserId))
    .where(and(isNull(expenses.deletedAt), ...where))
    .orderBy(desc(expenses.date), desc(expenses.createdAt));
  return rows.map(({ e, category, setNumber, payer: p, author: a }) => ({
    id: e.id,
    clientId: e.clientId,
    version: e.version,
    date: e.date,
    category,
    description: e.description,
    amount: e.amount,
    setId: e.setId,
    setNumber,
    overhead: e.overhead,
    paidBy: p?.id ? { id: p.id, name: p.name } : null,
    receiptKey: e.receiptKey,
    capitalItem: e.capitalItem,
    possibleDuplicateOf: e.possibleDuplicateOf,
    createdBy: a,
    createdAt: e.createdAt.toISOString(),
  }));
}

// First and last-plus-one day of a month ("2026-09" → 2026-09-01, 2026-10-01)
export function monthRange(month: string): [string, string] {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  return [`${month}-01`, `${next}-01`];
}

export const inMonth = (month: string) => {
  const [from, to] = monthRange(month);
  return [gte(expenses.date, from), lt(expenses.date, to)];
};
