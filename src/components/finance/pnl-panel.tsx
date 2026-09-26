"use client";
// Set profit and loss: pick a Set or all closed Sets; revenue, expenses, profit, margin, per-bird figures, spend by category
import { useState } from "react";
import { BarList } from "@/components/kotila/charts/bar-list";
import { Figure } from "@/components/kotila/figure";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { Rows } from "@/components/kotila/rows";
import { Segmented } from "@/components/kotila/segmented";
import { usePnl } from "@/hooks/queries/use-finance";
import type { SetSummary } from "@/types/sets";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { pnlHeadline } from "@/utils/metrics/finance-headlines";
import { defaultPnlChoice, pnlChoices } from "@/utils/sets/pnl-choices";

const money = (n: number) => (Number.isFinite(n) ? naira(n) : "—");

export function PnlPanel({ sets }: { sets: SetSummary[] }) {
  const choices = pnlChoices(sets);
  const [choice, setChoice] = useState(() => defaultPnlChoice(sets) ?? "");
  const ids = choices.find((c) => c.value === choice)?.ids ?? [];
  const pnl = usePnl(ids);
  if (pnl.isError) return <Notice tone="alert">{pnl.error.message}</Notice>;
  const p = pnl.data;
  const h = p ? pnlHeadline(p) : { title: "Set profit and loss", subtitle: "Loading…" };
  return (
    <Panel headline title={h.title} subtitle={h.subtitle}>
      <Segmented label="Show" options={choices.map(({ value, label }) => ({ value, label }))} value={choice} onChange={setChoice} />
      {p ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Rows items={[
              { label: `Bird sales · ${count(p.birdsSold)} birds`, value: naira(p.birdRevenue) },
              { label: "Manure", value: naira(p.manureRevenue) },
              { label: "Revenue", value: naira(p.pnl.revenue), total: true },
              { label: "Expenses", value: naira(-p.pnl.expenses) },
              { label: "Net profit", value: naira(p.pnl.profit), total: true, tone: p.pnl.profit < 0 ? "alert" : undefined },
              { label: "Net margin (net profit ÷ revenue)", value: pct(p.pnl.margin, 2) },
            ]} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Figure label="Cost per bird sold" value={money(p.pnl.costPerBirdSold)} size="sm" />
              <Figure label="Revenue per bird" value={money(p.pnl.revenuePerBird)} size="sm" />
              <Figure label="Margin per bird" value={money(p.pnl.marginPerBird)} size="sm" />
              <Figure label="Feed share of cost" value={p.feedShare === null ? "—" : pct(p.feedShare, 0)} size="sm" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <strong className="text-[17px] leading-6 text-ink">Expenses by category</strong>
            {p.byCategory.length ? <BarList items={p.byCategory} /> : <p className="m-0 text-body text-ink-muted">Nothing spent on {ids.length > 1 ? "these Sets" : "this Set"} yet.</p>}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
