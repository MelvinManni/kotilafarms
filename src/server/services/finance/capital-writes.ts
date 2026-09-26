// Owner writes: add a shareholder, record capital in or out, record a loan, mark a loan repaid — once per clientId, audited
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { capitalEntries, loans, shareholders } from "@/db/schema";
import { recordChange, recordCreate } from "@/server/audit";
import { conflict, notFound, unprocessable } from "@/server/errors";
import type { CapitalEntryCreate, LoanCreate, LoanRepay, ShareholderCreate, ShareholderUpdate } from "@/schemas/capital";
import type { SessionUser } from "@/types/session";

async function shareholder(db: Executor, id: string) {
  const [row] = await db.select().from(shareholders).where(and(eq(shareholders.id, id), isNull(shareholders.deletedAt)));
  if (!row) throw unprocessable("That shareholder wasn't found.");
  return row;
}

export async function addShareholder(db: Executor, input: ShareholderCreate, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(shareholders).where(eq(shareholders.clientId, input.clientId));
    if (existing) return existing;
    const [row] = await tx.insert(shareholders).values({ ...input, createdBy: actor.id }).returning();
    await recordCreate(tx, "shareholders", row!.id, { userId: actor.id });
    return row!;
  });
}

// Fix a name or share count in the register; the reason is kept in the audit trail
export async function updateShareholder(db: Executor, id: string, input: ShareholderUpdate, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const before = await shareholder(tx, id);
    if (before.version !== input.baseVersion) throw conflict("Someone changed this shareholder. Open it again.");
    const after = { ...(input.name !== undefined ? { name: input.name } : {}), ...(input.shares !== undefined ? { shares: input.shares } : {}) };
    const [row] = await tx.update(shareholders).set({ ...after, version: before.version + 1 }).where(eq(shareholders.id, id)).returning();
    await recordChange(tx, { table: "shareholders", rowId: id, before, after, reason: input.reason, userId: actor.id });
    return row!;
  });
}

export async function addCapitalEntry(db: Executor, input: CapitalEntryCreate, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(capitalEntries).where(eq(capitalEntries.clientId, input.clientId));
    if (existing) return existing;
    await shareholder(tx, input.shareholderId);
    if (input.date > today) throw unprocessable("The date can't be in the future.");
    const amount = input.kind === "withdrawn" ? -input.amount : input.amount;
    const [row] = await tx.insert(capitalEntries).values({ clientId: input.clientId, shareholderId: input.shareholderId, date: input.date, amount, note: input.note ?? null, createdBy: actor.id }).returning();
    await recordCreate(tx, "capital_entries", row!.id, { userId: actor.id });
    return row!;
  });
}

export async function addLoan(db: Executor, input: LoanCreate, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(loans).where(eq(loans.clientId, input.clientId));
    if (existing) return existing;
    await shareholder(tx, input.lenderShareholderId);
    if (input.advancedOn > today) throw unprocessable("The date can't be in the future.");
    const [row] = await tx.insert(loans).values({ ...input, createdBy: actor.id }).returning();
    await recordCreate(tx, "loans", row!.id, { userId: actor.id });
    return row!;
  });
}

export async function repayLoan(db: Executor, id: string, input: LoanRepay, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(loans).where(and(eq(loans.id, id), isNull(loans.deletedAt)));
    if (!before) throw notFound("That loan");
    if (before.version !== input.baseVersion) throw conflict("Someone changed this loan. Open it again.");
    if (before.repaidOn) throw unprocessable("This loan is already repaid.");
    if (input.repaidOn < before.advancedOn || input.repaidOn > today) throw unprocessable("Choose a day between the loan and today.");
    const after = { repaidOn: input.repaidOn };
    const [row] = await tx.update(loans).set({ ...after, version: before.version + 1 }).where(eq(loans.id, id)).returning();
    await recordChange(tx, { table: "loans", rowId: id, before, after, userId: actor.id });
    return row!;
  });
}
