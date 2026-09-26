// Partner capital and loans: ownership from the share register, money in and out per person, loans with interest, borrowing capacity
import "server-only";
import { asc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { capitalEntries, loans, shareholders } from "@/db/schema";
import { getSetting } from "@/server/services/settings";
import { queries } from "@/server/queries";
import type { CapitalPayload } from "@/types/capital";
import { borrowingCapacity, loanInterest } from "@/utils/metrics/loans";
import { capitalPosition, ownershipShare } from "@/utils/metrics/money";

export async function capitalFor(db: Executor, today: string): Promise<CapitalPayload> {
  const [people, entries, loanRows, capPct] = await queries(db, [
    () => db.select().from(shareholders).where(isNull(shareholders.deletedAt)).orderBy(asc(shareholders.createdAt)),
    () => db.select().from(capitalEntries).where(isNull(capitalEntries.deletedAt)),
    () => db.select({ l: loans, name: shareholders.name }).from(loans).innerJoin(shareholders, eq(shareholders.id, loans.lenderShareholderId)).where(isNull(loans.deletedAt)).orderBy(asc(loans.advancedOn)),
    () => getSetting<number>(db, "borrowingCapPct"),
  ]);
  const totalShares = people.reduce((a, p) => a + p.shares, 0);
  const rows = people
    .map((p) => ({ id: p.id, version: p.version, name: p.name, shares: p.shares, ownership: ownershipShare(p.shares, totalShares), ...capitalPosition(entries.filter((e) => e.shareholderId === p.id).map((e) => e.amount)) }))
    .sort((a, b) => b.shares - a.shares);
  const totals = { shares: totalShares, contributed: rows.reduce((a, r) => a + r.contributed, 0), withdrawn: rows.reduce((a, r) => a + r.withdrawn, 0), net: rows.reduce((a, r) => a + r.net, 0) };
  const list = loanRows.map(({ l, name }) => ({ id: l.id, lender: { id: l.lenderShareholderId, name }, amount: l.amount, advancedOn: l.advancedOn, repaidOn: l.repaidOn, rate: l.rate, whtRate: l.whtRate, interest: loanInterest(l.amount, l.advancedOn, l.repaidOn ?? today, l.rate, l.whtRate), version: l.version }));
  const outstanding = list.filter((l) => !l.repaidOn).reduce((a, l) => a + l.amount, 0);
  const pct = capPct ?? 0.5;
  const c = borrowingCapacity(outstanding, totals.net, pct);
  return { shareholders: rows, totals, loans: list.reverse(), capacity: { outstanding, equity: totals.net, capPct: pct, cap: c.cap, headroom: c.headroom, ratio: Number.isFinite(c.ratio) ? c.ratio : null, overCap: c.overCap } };
}
