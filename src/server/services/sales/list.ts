// All sales (bird and manure) for the Sales page, and the outstanding balances
import "server-only";
import { and, desc, eq, isNull, type SQL } from "drizzle-orm";
import type { Executor } from "@/db";
import { otherSales, sales, sets, users } from "@/db/schema";
import { saleRows } from "@/server/services/sales/rows";
import { getSetting } from "@/server/services/settings";
import type { Outstanding, SalesList } from "@/types/sale";

export async function listSales(db: Executor, f: { setId?: string; buyerId?: string }, today: string): Promise<SalesList> {
  const where: SQL[] = [];
  if (f.setId) where.push(eq(sales.setId, f.setId));
  if (f.buyerId) where.push(eq(sales.buyerId, f.buyerId));
  const other = f.buyerId
    ? []
    : await db
        .select({ id: otherSales.id, date: otherSales.date, amount: otherSales.amount, set: { id: sets.id, number: sets.number }, createdBy: users.name })
        .from(otherSales)
        .innerJoin(sets, eq(sets.id, otherSales.setId))
        .innerJoin(users, eq(users.id, otherSales.createdBy))
        .where(and(isNull(otherSales.deletedAt), ...(f.setId ? [eq(otherSales.setId, f.setId)] : [])))
        .orderBy(desc(otherSales.date));
  return {
    sales: await saleRows(db, where, today),
    other: other.map((o) => ({ kind: "manure" as const, ...o })),
    bulkRate: await getSetting<number>(db, "bulkRatePerBird"),
  };
}

export async function outstanding(db: Executor, today: string): Promise<Outstanding> {
  const rows = (await saleRows(db, [], today)).filter((r) => r.balance > 0).sort((a, b) => a.date.localeCompare(b.date));
  return {
    rows,
    total: { sales: rows.reduce((n, r) => n + r.total, 0), paid: rows.reduce((n, r) => n + r.paid, 0), balance: rows.reduce((n, r) => n + r.balance, 0) },
    buyers: new Set(rows.map((r) => r.buyer.id)).size,
  };
}
