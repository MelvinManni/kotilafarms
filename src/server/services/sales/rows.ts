// Read sales with buyer, Set and payments, and work out paid, balance and days owed
import "server-only";
import { and, asc, desc, eq, inArray, isNull, type SQL } from "drizzle-orm";
import type { Executor } from "@/db";
import { buyers, salePayments, sales, sets, users } from "@/db/schema";
import { getSetting } from "@/server/services/settings";
import type { SaleRow } from "@/types/sale";
import { daysBetween } from "@/utils/dates/days-between";
import { saleBalance } from "@/utils/metrics/money";
import { salePaid } from "@/utils/metrics/sale-amounts";

export async function saleRows(db: Executor, where: SQL[], today: string): Promise<SaleRow[]> {
  const rows = await db
    .select({ s: sales, set: { id: sets.id, number: sets.number, closedOn: sets.closedOn }, buyer: { id: buyers.id, name: buyers.name }, author: users.name })
    .from(sales)
    .innerJoin(sets, eq(sets.id, sales.setId))
    .innerJoin(buyers, eq(buyers.id, sales.buyerId))
    .innerJoin(users, eq(users.id, sales.createdBy))
    .where(and(isNull(sales.deletedAt), ...where))
    .orderBy(desc(sales.date), desc(sales.createdAt));
  const ids = rows.map((r) => r.s.id);
  const payments = ids.length
    ? await db
        .select({ saleId: salePayments.saleId, id: salePayments.id, date: salePayments.date, amount: salePayments.amount, method: salePayments.method, by: users.name })
        .from(salePayments)
        .innerJoin(users, eq(users.id, salePayments.createdBy))
        .where(and(inArray(salePayments.saleId, ids), isNull(salePayments.deletedAt)))
        .orderBy(asc(salePayments.date))
    : [];
  const bulk = await getSetting<number>(db, "bulkRatePerBird");
  return rows.map(({ s, set, buyer, author }) => {
    const mine = payments.filter((p) => p.saleId === s.id).map(({ saleId, ...p }) => p);
    const amounts = mine.map((p) => p.amount);
    const balance = saleBalance(s, amounts);
    return {
      kind: "birds",
      id: s.id,
      clientId: s.clientId,
      version: s.version,
      date: s.date,
      set,
      buyer,
      birds: s.birds,
      pricePerBird: s.pricePerBird,
      total: s.total,
      deposit: s.deposit,
      paidAtSale: s.paidAtSale,
      payments: mine,
      paid: salePaid(s, amounts),
      balance,
      daysOwed: balance > 0 ? Math.max(0, daysBetween(s.date, today)) : 0,
      belowBulk: bulk !== null && s.pricePerBird < bulk,
      method: s.method,
      note: s.note,
      createdBy: author,
    };
  });
}
