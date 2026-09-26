"use client";
// /sales/buyers/:id: one buyer's sales, average price against the bulk rate, and balance
import { Figure } from "@/components/kotila/figure";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { SalesTable } from "@/components/sales/sales-table";
import { PageHeader } from "@/components/layout/page-header";
import { useBuyer } from "@/hooks/queries/use-sales";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";

export function BuyerScreen({ id }: { id: string }) {
  const data = useBuyer(id);
  if (data.isError) return <Notice tone="alert">{data.error.message}</Notice>;
  if (!data.data) return <p className="text-body text-ink-muted max-lg:text-on-deep-muted">Loading the buyer…</p>;
  const { buyer, sales, bulkRate } = data.data;
  const vsBulk = buyer.averagePrice !== null && bulkRate ? buyer.averagePrice - bulkRate : null;
  return (
    <>
      <PageHeader eyebrow="Sales › Buyers" title={buyer.name} />
      <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface px-6 py-5 lg:grid-cols-4">
        <Figure label="Birds bought" value={count(buyer.birds)} />
        <Figure label="Average per bird" value={buyer.averagePrice === null ? "—" : naira(buyer.averagePrice)} tone={vsBulk !== null && vsBulk < 0 ? "alert" : undefined} sub={vsBulk === null ? undefined : vsBulk < 0 ? `${naira(-vsBulk)} under the bulk rate` : "at or above the bulk rate"} />
        <Figure label="Spent with the farm" value={naira(buyer.spent)} />
        <Figure label="Owes" value={naira(buyer.balance)} tone={buyer.balance > 0 ? "owed" : undefined} />
      </div>
      <Panel flush title="Every sale" subtitle="Newest first">
        <SalesTable sales={sales} onOpen={() => undefined} />
      </Panel>
    </>
  );
}
