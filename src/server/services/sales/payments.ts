// Record a payment on a sale: once per clientId, and never more than the balance
import "server-only";
import { eq } from "drizzle-orm";
import type { Executor } from "@/db";
import { salePayments, sales } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { notFound, unprocessable } from "@/server/errors";
import { saleRows } from "@/server/services/sales/rows";
import type { PaymentCreate } from "@/schemas/sale";
import type { SessionUser } from "@/types/session";
import { naira } from "@/utils/format/naira";

export async function addPayment(db: Executor, saleId: string, input: PaymentCreate, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(salePayments).where(eq(salePayments.clientId, input.clientId));
    if (existing) return { payment: existing, created: false };
    const [sale] = await saleRows(tx, [eq(sales.id, saleId)], today);
    if (!sale) throw notFound("That sale");
    if (input.amount > sale.balance) throw unprocessable(`That's more than the ${naira(sale.balance)} still owed.`);
    if (input.date < sale.date) throw unprocessable("A payment can't be before the sale.");
    const [payment] = await tx.insert(salePayments).values({ ...input, saleId, createdBy: actor.id }).returning();
    await recordCreate(tx, "sale_payments", payment!.id, { userId: actor.id });
    return { payment: payment!, created: true };
  });
}

