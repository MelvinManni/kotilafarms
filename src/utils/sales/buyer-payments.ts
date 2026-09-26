// Every payment from a buyer, newest first: deposits and money paid at the sale count as payments too
import type { PaymentMethod, SaleRow } from "@/types/sale";

export type BuyerPayment = { key: string; date: string; amount: number; method: PaymentMethod; sale: { date: string; birds: number }; by: string; kind: "deposit" | "at sale" | "later" };

export function buyerPayments(sales: SaleRow[]): BuyerPayment[] {
  return sales
    .flatMap((s) => {
      const forSale = { date: s.date, birds: s.birds };
      return [
        ...(s.deposit ? [{ key: `${s.id}-deposit`, date: s.date, amount: s.deposit, method: s.method, sale: forSale, by: s.createdBy, kind: "deposit" as const }] : []),
        ...(s.paidAtSale ? [{ key: `${s.id}-sale`, date: s.date, amount: s.paidAtSale, method: s.method, sale: forSale, by: s.createdBy, kind: "at sale" as const }] : []),
        ...s.payments.map((p) => ({ key: p.id, date: p.date, amount: p.amount, method: p.method, sale: forSale, by: p.by, kind: "later" as const })),
      ];
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
