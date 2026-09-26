"use client";
// One sale: amounts, what was paid when, what is owed; record a payment or see its history
import { Button } from "@/components/kotila/button";
import { Rows } from "@/components/kotila/rows";
import { Sheet } from "@/components/kotila/sheet";
import { methodLabel } from "@/constants/payment-methods";
import type { SaleRow } from "@/types/sale";
import { count } from "@/utils/format/count";
import { farmDay } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

type SaleSheetProps = { sale: SaleRow; onClose: () => void; onPay: () => void; onHistory: () => void };

export function SaleSheet({ sale, onClose, onPay, onHistory }: SaleSheetProps) {
  const items = [
    { label: `${count(sale.birds)} birds × ${naira(sale.pricePerBird)}`, value: naira(sale.total), sub: sale.belowBulk ? "under the bulk rate" : undefined },
    ...(sale.deposit ? [{ label: "Deposit taken earlier", value: naira(-sale.deposit) }] : []),
    { label: `Paid at the sale · ${methodLabel(sale.method)}`, value: naira(-sale.paidAtSale) },
    ...sale.payments.map((p) => ({ label: `Paid ${farmDay(p.date)} · ${methodLabel(p.method)}`, value: naira(-p.amount), sub: `recorded by ${p.by.split(" ")[0]}` })),
    { label: sale.balance > 0 ? "Still owed" : "Paid in full", value: naira(sale.balance), total: true, tone: sale.balance > 0 ? ("owed" as const) : undefined },
  ];
  return (
    <Sheet
      title={`${sale.buyer.name} · Set ${sale.set.number}`}
      description={`Sold ${farmDay(sale.date)} · entered by ${sale.createdBy}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="quiet" icon="history" onClick={onHistory}>History</Button>
          {sale.balance > 0 ? <Button variant="owed" icon="naira" onClick={onPay}>Record a payment</Button> : <Button onClick={onClose}>Close</Button>}
        </>
      }
    >
      <Rows items={items} />
    </Sheet>
  );
}
