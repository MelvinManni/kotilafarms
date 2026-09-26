// Expenses for the list page, filtered, with the month's summary figures
import "server-only";
import { eq, type SQL } from "drizzle-orm";
import type { Executor } from "@/db";
import { expenses } from "@/db/schema";
import { expenseRows, inMonth } from "@/server/services/expenses/rows";
import type { ExpenseFilters } from "@/schemas/expense";
import type { ExpenseList } from "@/types/expense";
import { summarizeExpenses } from "@/utils/metrics/expense-summary";

export async function listExpenses(db: Executor, f: ExpenseFilters): Promise<ExpenseList> {
  const where: SQL[] = [];
  if (f.set === "overhead" || f.show === "overhead") where.push(eq(expenses.overhead, true));
  else if (f.set) where.push(eq(expenses.setId, f.set));
  else if (f.show === "sets") where.push(eq(expenses.overhead, false));
  if (f.categoryId) where.push(eq(expenses.categoryId, f.categoryId));
  if (f.month) where.push(...inMonth(f.month));
  const rows = await expenseRows(db, where);
  return { rows, summary: summarizeExpenses(rows) };
}
