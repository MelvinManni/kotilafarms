// Profit and loss for one Set or several added together; capital items count their share when spread over Sets
import "server-only";
import { and, eq, inArray, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { expenseCategories, expenses, sets } from "@/db/schema";
import { unprocessable } from "@/server/errors";
import { setTotals } from "@/server/services/sets/aggregates";
import type { PnlPayload } from "@/types/finance";
import { categoryShare } from "@/utils/metrics/category-share";
import { setPnl } from "@/utils/metrics/set-pnl";

export async function pnlFor(db: Executor, setIds: string[]): Promise<PnlPayload> {
  const rows = await db.select().from(sets).where(and(inArray(sets.id, setIds), isNull(sets.deletedAt)));
  if (rows.length !== setIds.length) throw unprocessable("One of those Sets wasn't found.");
  const [totals, spent] = await Promise.all([
    setTotals(db, setIds),
    db.select({ amount: expenses.amount, capital: expenses.capitalItem, spread: expenses.spreadOverSets, category: expenseCategories.name }).from(expenses).innerJoin(expenseCategories, eq(expenseCategories.id, expenses.categoryId)).where(and(inArray(expenses.setId, setIds), isNull(expenses.deletedAt))),
  ]);
  const byCategory: Record<string, number> = {};
  for (const e of spent) byCategory[e.category] = (byCategory[e.category] ?? 0) + (e.capital && e.spread ? Math.round(e.amount / e.spread) : e.amount);
  const sum = (key: "sold" | "birdRevenue" | "manure") => setIds.reduce((a, id) => a + totals.get(id)![key], 0);
  const intake = rows.reduce((a, s) => a + s.intake, 0);
  const pnl = setPnl({ intake, birdsSold: sum("sold"), birdRevenue: sum("birdRevenue"), manureRevenue: sum("manure"), expensesByCategory: byCategory });
  const list = Object.entries(byCategory).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  return {
    sets: rows.sort((a, b) => b.number - a.number).map((s) => ({ id: s.id, number: s.number, startDate: s.startDate, closedOn: s.closedOn, status: s.status })),
    intake, birdsSold: sum("sold"), birdRevenue: sum("birdRevenue"), manureRevenue: sum("manure"), pnl, byCategory: list,
    feedShare: list.length ? categoryShare(list, "Feed") : null,
  };
}
