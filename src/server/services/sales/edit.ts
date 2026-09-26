// Change a sale: amounts must still agree and not be overpaid; late changes to birds or money need a reason
import "server-only";
import { and, eq, isNull, sql, sum } from "drizzle-orm";
import type { Executor } from "@/db";
import { salePayments, sales } from "@/db/schema";
import { recordChange } from "@/server/audit";
import { conflict, notFound, unprocessable } from "@/server/errors";
import type { SaleEdit } from "@/schemas/sale";
import type { SessionUser } from "@/types/session";
import { saleAmountsAgree } from "@/utils/metrics/sale-amounts";

const COUNTS = ["birds", "pricePerBird", "total", "paidAtSale", "deposit"] as const;

export async function editSale(db: Executor, id: string, input: SaleEdit, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(sales).where(and(eq(sales.id, id), isNull(sales.deletedAt)));
    if (!before) throw notFound("That sale");
    if (before.version !== input.baseVersion) throw conflict("Someone changed this sale since you opened it. Reload, then try again.");
    const { baseVersion, reason, ...changes } = input;
    const after = { ...before, ...changes };
    if (!saleAmountsAgree(after.birds, after.pricePerBird, after.total)) throw unprocessable("Birds × price per bird doesn't match the total.");
    const [paidLater] = await tx.select({ n: sum(salePayments.amount).mapWith(Number) }).from(salePayments).where(and(eq(salePayments.saleId, id), isNull(salePayments.deletedAt)));
    if (after.deposit + after.paidAtSale + (paidLater?.n ?? 0) > after.total) throw unprocessable("More is paid than the sale total.");
    const late = before.date < today && COUNTS.some((k) => changes[k] !== undefined && changes[k] !== before[k]);
    if (late && !reason?.trim()) throw unprocessable("Say why you're changing this sale after the day.");
    await tx.update(sales).set({ ...changes, version: sql`${sales.version} + 1` }).where(eq(sales.id, id));
    await recordChange(tx, { table: "sales", rowId: id, before, after: changes, reason: reason ?? null, userId: actor.id });
  });
}
