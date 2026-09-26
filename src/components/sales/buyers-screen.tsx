"use client";
// /sales/buyers: every buyer with birds bought, average price (against the bulk rate) and what they owe
import { useRouter } from "next/navigation";
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { useBuyers } from "@/hooks/queries/use-sales";
import { count } from "@/utils/format/count";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

const none = { value: "—", tone: "muted" as const };

export function BuyersScreen() {
  const router = useRouter();
  const buyers = useBuyers();
  const rows = (buyers.data ?? []).map((b) => ({
    id: b.id,
    name: { value: b.name, sub: b.phone ?? undefined },
    birds: count(b.birds),
    avg: b.averagePrice === null ? none : b.vsBulk !== null && b.vsBulk < 0 ? { value: naira(b.averagePrice), sub: `${naira(-b.vsBulk)} under bulk rate`, tone: "alert" as const } : naira(b.averagePrice),
    spent: naira(b.spent),
    owed: b.balance > 0 ? { value: naira(b.balance), tone: "owed" as const } : none,
    last: b.lastSale ? shortDate(b.lastSale) : none,
  }));
  return (
    <>
      <PageHeader eyebrow="Sales ›" title="Buyers" />
      {buyers.isError ? <Notice tone="alert">{buyers.error.message}</Notice> : null}
      <Panel flush title="Every buyer" subtitle="Select a buyer to see every sale to them.">
        <LedgerTable
          caption="Buyers"
          columns={[{ key: "name", label: "Buyer" }, { key: "birds", label: "Birds bought", align: "right" }, { key: "avg", label: "Average per bird", align: "right" }, { key: "spent", label: "Spent", align: "right" }, { key: "owed", label: "Owes", align: "right" }, { key: "last", label: "Last sale" }]}
          rows={rows}
          onRowClick={(r) => router.push(`/sales/buyers/${r.id}`)}
        />
      </Panel>
    </>
  );
}
