// Expense category ids by key (feed, transport), for the expenses behind feed buys
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { expenseCategories } from "@/db/schema";

export async function categoryIdByKey(db: Executor, key: string) {
  const [row] = await db.select({ id: expenseCategories.id }).from(expenseCategories).where(and(eq(expenseCategories.key, key), isNull(expenseCategories.deletedAt)));
  if (!row) throw new Error(`Expense category "${key}" is missing. Run pnpm db:setup.`);
  return row.id;
}
