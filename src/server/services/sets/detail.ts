// One Set with its spend by category and deaths by day
import "server-only";
import { and, eq, isNull, sum } from "drizzle-orm";
import type { Executor } from "@/db";
import { expenseCategories, expenses, sets } from "@/db/schema";
import { can } from "@/lib/auth/roles";
import { notFound } from "@/server/errors";
import { deathsByDay, setTotals } from "@/server/services/sets/aggregates";
import { summarizeSet } from "@/server/services/sets/summarize";
import { queries } from "@/server/queries";
import type { Role } from "@/types/role";
import type { SetDetail } from "@/types/sets";

export async function getSet(db: Executor, id: string, role: Role, today: string): Promise<SetDetail> {
  const [row] = await db.select().from(sets).where(and(eq(sets.id, id), isNull(sets.deletedAt)));
  if (!row) throw notFound("That Set");
  const [totals, logs] = await queries(db, [() => setTotals(db, [id]), () => deathsByDay(db, [id])]);
  const t = totals.get(id)!;
  const detail: SetDetail = {
    ...summarizeSet(row, t, logs, today, role),
    dayOldSupplier: row.dayOldSupplier,
    deathsByDay: logs.map((l) => ({ date: l.date, deaths: l.deaths })),
    counts: { logs: t.logs, weights: t.weights, sales: t.salesCount, expenses: t.expenseCount },
  };
  if (!can.seeMoney(role)) return detail;
  const byCategory = await db
    .select({ label: expenseCategories.name, value: sum(expenses.amount).mapWith(Number) })
    .from(expenses)
    .innerJoin(expenseCategories, eq(expenseCategories.id, expenses.categoryId))
    .where(and(eq(expenses.setId, id), isNull(expenses.deletedAt)))
    .groupBy(expenseCategories.name);
  return { ...detail, dayOldUnitCost: row.dayOldUnitCost, spendByCategory: byCategory.sort((a, b) => b.value - a.value) };
}
