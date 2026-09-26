"use client";
// /sales: owed notice, outstanding balances, then every sale by tab (all, owed, per Set)
import { useState } from "react";
import { HistorySheet } from "@/components/audit/history-sheet";
import { ManureSheet } from "@/components/sales/manure-sheet";
import { NewSaleSheet } from "@/components/sales/new-sale-sheet";
import { OutstandingTable } from "@/components/sales/outstanding-table";
import { OwedNotice } from "@/components/sales/owed-notice";
import { PaymentSheet } from "@/components/sales/payment-sheet";
import { SaleSheet } from "@/components/sales/sale-sheet";
import { SalesTable } from "@/components/sales/sales-table";
import { Button } from "@/components/kotila/button";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { Tabs } from "@/components/kotila/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { useOutstanding, useSales } from "@/hooks/queries/use-sales";
import type { SaleRow } from "@/types/sale";
import { salesHeadline } from "@/utils/metrics/sales-headline";

type SheetState = { kind: "new" | "manure" | "pay" } | { kind: "sale" | "pay-one" | "history"; sale: SaleRow } | null;

export function SalesScreen() {
  const list = useSales();
  const owed = useOutstanding();
  const [tab, setTab] = useState("all");
  const [sheet, setSheet] = useState<SheetState>(null);
  const all = [...(list.data?.sales ?? []), ...(list.data?.other ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const setNumbers = [...new Set(all.map((s) => s.set.number))].sort((a, b) => b - a);
  const shown = tab === "owed" ? all.filter((s) => s.kind === "birds" && s.balance > 0) : tab === "all" ? all : all.filter((s) => `set${s.set.number}` === tab);
  const headline = list.data ? salesHeadline(list.data.sales) : null;
  return (
    <>
      <PageHeader
        eyebrow={headline ?? undefined}
        title="Sales"
        actions={
          <>
            <Button onClick={() => setSheet({ kind: "manure" })}>Manure sale</Button>
            {owed.data?.rows.length ? <Button icon="naira" onClick={() => setSheet({ kind: "pay" })}>Record a payment</Button> : null}
            <Button variant="primary" icon="plus" onClick={() => setSheet({ kind: "new" })}>New sale</Button>
          </>
        }
      />
      {owed.data ? <OwedNotice owed={owed.data} action={{ label: "Record a payment", onClick: () => setSheet({ kind: "pay" }) }} /> : null}
      {owed.data?.rows.length ? (
        <Panel flush title="Outstanding balances" subtitle="Oldest first. A balance clears only when the payment is recorded." action={{ label: "All buyers", href: "/sales/buyers" }}>
          <OutstandingTable owed={owed.data} onOpen={(sale) => setSheet({ kind: "sale", sale })} />
        </Panel>
      ) : null}
      {list.isError ? <Notice tone="alert" action={{ label: "Try again", onClick: () => list.refetch() }}>{list.error.message}</Notice> : null}
      {list.data && all.length === 0 ? (
        <EmptyState title="No sales yet" icon="sales" action={{ label: "New sale", onClick: () => setSheet({ kind: "new" }) }}>
          Record every sale with what was paid and what is still owed. Balances show here until they are paid.
        </EmptyState>
      ) : null}
      {all.length ? (
        <section className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="px-6 pt-2">
            <Tabs items={[{ value: "all", label: "All sales", count: all.length }, { value: "owed", label: "Owed", count: owed.data?.rows.length ?? 0 }, ...setNumbers.map((n) => ({ value: `set${n}`, label: `Set ${n}`, count: all.filter((s) => s.set.number === n).length }))]} active={tab} onChange={setTab} />
          </div>
          <SalesTable sales={shown} onOpen={(sale) => setSheet({ kind: "sale", sale })} />
        </section>
      ) : null}
      {sheet?.kind === "new" ? <NewSaleSheet bulkRate={list.data?.bulkRate ?? null} onClose={() => setSheet(null)} /> : null}
      {sheet?.kind === "manure" ? <ManureSheet onClose={() => setSheet(null)} /> : null}
      {sheet?.kind === "pay" ? <PaymentSheet owed={owed.data?.rows ?? []} onClose={() => setSheet(null)} /> : null}
      {sheet?.kind === "pay-one" ? <PaymentSheet owed={owed.data?.rows ?? []} sale={sheet.sale} onClose={() => setSheet(null)} /> : null}
      {sheet?.kind === "sale" ? <SaleSheet sale={sheet.sale} onClose={() => setSheet(null)} onPay={() => setSheet({ kind: "pay-one", sale: sheet.sale })} onHistory={() => setSheet({ kind: "history", sale: sheet.sale })} /> : null}
      {sheet?.kind === "history" ? <HistorySheet table="sales" rowId={sheet.sale.id} title="Edit history" description={`${sheet.sale.buyer.name} · Set ${sheet.sale.set.number}`} onClose={() => setSheet(null)} /> : null}
    </>
  );
}
