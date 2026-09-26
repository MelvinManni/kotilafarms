// Cash position since the last count, and recording a count (reconciliation)
import "server-only";
import { asc, desc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { cashReconciliations, users } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { cashLines } from "@/server/services/finance/cash-lines";
import { outstanding } from "@/server/services/sales/list";
import type { CashPayload, Reconciliation } from "@/types/finance";
import type { SessionUser } from "@/types/session";
import { cashSince, reconcileDifference } from "@/utils/metrics/cash-since";

async function lastReconciliation(db: Executor): Promise<(Reconciliation & { enteredAt: string }) | null> {
  const [row] = await db.select({ r: cashReconciliations, by: users.name }).from(cashReconciliations).innerJoin(users, eq(users.id, cashReconciliations.createdBy)).where(isNull(cashReconciliations.deletedAt)).orderBy(desc(cashReconciliations.date), desc(cashReconciliations.createdAt)).limit(1);
  if (!row) return null;
  const { r, by } = row;
  return { id: r.id, date: r.date, countedCash: r.countedCash, bankBalance: r.bankBalance, expected: r.expected, difference: r.difference, note: r.note, by, enteredAt: r.createdAt.toISOString() };
}

export async function cashFor(db: Executor, today: string): Promise<CashPayload> {
  const [last, lines, owed] = await Promise.all([lastReconciliation(db), cashLines(db), outstanding(db, today)]);
  const c = cashSince(lines.moneyIn, lines.moneyOut, last ? { date: last.date, enteredAt: last.enteredAt, actual: last.countedCash + last.bankBalance } : null);
  const firstRecord = [...lines.moneyIn, ...lines.moneyOut].map((l) => l.date).sort()[0] ?? null;
  const since = last ? (({ enteredAt: _e, ...r }) => r)(last) : null;
  return { since, firstRecord, opening: c.opening, moneyIn: c.moneyIn, moneyOut: c.moneyOut, shouldBeOnHand: c.shouldBeOnHand, inRows: c.inByGroup, outRows: c.outByGroup, owed: { total: owed.total.balance, buyers: owed.buyers } };
}

export async function reconcile(db: Executor, input: { countedCash: number; bankBalance: number; note?: string | null }, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const { shouldBeOnHand } = await cashFor(tx, today);
    const [row] = await tx
      .insert(cashReconciliations)
      .values({ date: today, countedCash: input.countedCash, bankBalance: input.bankBalance, expected: shouldBeOnHand, difference: reconcileDifference(input.countedCash, input.bankBalance, shouldBeOnHand), note: input.note ?? null, clientId: crypto.randomUUID(), createdBy: actor.id })
      .returning();
    await recordCreate(tx, "cash_reconciliations", row!.id, { userId: actor.id });
    return row!;
  });
}

// Past counts, newest first
export async function listReconciliations(db: Executor) {
  return db.select({ id: cashReconciliations.id, date: cashReconciliations.date, expected: cashReconciliations.expected, difference: cashReconciliations.difference }).from(cashReconciliations).where(isNull(cashReconciliations.deletedAt)).orderBy(desc(cashReconciliations.date), asc(cashReconciliations.createdAt));
}
