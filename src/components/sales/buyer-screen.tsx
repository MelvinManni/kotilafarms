"use client";
// /sales/buyers/:id: one buyer's record — figures, how their price compares with the bulk rate, every sale and payment
import { useState } from "react";
import { HistorySheet } from "@/components/audit/history-sheet";
import { BuyerFigures } from "@/components/sales/buyer-figures";
import { BuyerPaymentsPanel } from "@/components/sales/buyer-payments-panel";
import { NewSaleSheet } from "@/components/sales/new-sale-sheet";
import { PaymentSheet } from "@/components/sales/payment-sheet";
import { SaleSheet } from "@/components/sales/sale-sheet";
import { SalesTable } from "@/components/sales/sales-table";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useBuyer } from "@/hooks/queries/use-sales";
import type { SaleRow } from "@/types/sale";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";
import { buyerInsight, underBulkNotice } from "@/utils/metrics/buyer-insight";
import { buyerPayments } from "@/utils/sales/buyer-payments";

type Open = { kind: "new" | "pay" } | { kind: "sale" | "pay-one" | "history"; sale: SaleRow } | null;

export function BuyerScreen({ id }: { id: string }) {
  const data = useBuyer(id);
  const [open, setOpen] = useState<Open>(null);
  if (data.isError) return <Notice tone="alert">{data.error.message}</Notice>;
  if (!data.data) return <p className="text-body text-ink-muted max-lg:text-on-deep-muted">Loading the buyer…</p>;
  const { buyer, sales, bulkRate } = data.data;
  const b = buyerInsight(sales, bulkRate, todayInZone(FARM_TIMEZONE));
  const notice = underBulkNotice(buyer.name, b);
  const owing = sales.filter((s) => s.balance > 0);
  const since = b.since ? `buying since ${new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${b.since}T12:00:00Z`))}` : "no sales yet";
  const close = () => setOpen(null);
  return (
    <>
      <PageHeader
        eyebrow={`Sales › Buyers · ${buyer.phone ? `${buyer.phone} · ` : ""}${since}`}
        title={buyer.name}
        actions={
          <>
            {owing.length ? <Button icon="naira" onClick={() => setOpen({ kind: "pay" })}>Record a payment</Button> : null}
            <Button variant="primary" icon="plus" onClick={() => setOpen({ kind: "new" })}>New sale to {buyer.name}</Button>
          </>
        }
      />
      <BuyerFigures b={b} bulkRate={bulkRate} />
      {notice ? <Notice tone="warning" title={notice.title}>{notice.body}</Notice> : null}
      <Panel flush title="Every sale">
        <SalesTable
          hideBuyer
          caption={`Every sale to ${buyer.name}, newest first`}
          sales={sales}
          onOpen={(sale) => setOpen({ kind: "sale", sale })}
          footer={sales.length ? { date: `${b.sales} ${b.sales === 1 ? "sale" : "sales"}`, set: "", birds: count(b.birds), per: b.averagePrice === null ? "—" : naira(b.averagePrice), total: naira(b.total), paid: naira(b.paid), bal: b.owed ? { value: naira(b.owed), tone: "owed" } : "—", method: "" } : undefined}
        />
      </Panel>
      <BuyerPaymentsPanel name={buyer.name} payments={buyerPayments(sales)} />
      {open?.kind === "new" ? <NewSaleSheet bulkRate={bulkRate} buyerId={buyer.id} onClose={close} /> : null}
      {open?.kind === "pay" ? <PaymentSheet owed={owing} onClose={close} /> : null}
      {open?.kind === "pay-one" ? <PaymentSheet owed={owing} sale={open.sale} onClose={close} /> : null}
      {open?.kind === "sale" ? <SaleSheet sale={open.sale} onClose={close} onPay={() => setOpen({ kind: "pay-one", sale: open.sale })} onHistory={() => setOpen({ kind: "history", sale: open.sale })} /> : null}
      {open?.kind === "history" ? <HistorySheet table="sales" rowId={open.sale.id} title="Edit history" description={`${buyer.name} · Set ${open.sale.set.number}`} onClose={close} /> : null}
    </>
  );
}
