// Cash position: what should be on hand, money in and out since the last count, owed (not cash yet), and Reconcile
import { Button } from "@/components/kotila/button";
import { Figure } from "@/components/kotila/figure";
import { Panel } from "@/components/kotila/panel";
import { Rows } from "@/components/kotila/rows";
import type { CashPayload } from "@/types/finance";
import { naira } from "@/utils/format/naira";
import { shortDate } from "@/utils/format/dates";
import { cashHeadline } from "@/utils/metrics/finance-headlines";

type CashPanelProps = { cash: CashPayload; canReconcile: boolean; onReconcile: () => void };

const out = (n: number) => naira(-n);

export function CashPanel({ cash: c, canReconcile, onReconcile }: CashPanelProps) {
  const h = cashHeadline(c);
  const from = c.since ? shortDate(c.since.date, false) : c.firstRecord ? shortDate(c.firstRecord, false) : null;
  const kinds = c.outRows.length;
  return (
    <Panel headline title={h.title} subtitle={h.subtitle}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Figure label="Money in" value={naira(c.moneyIn)} sub="bird sales, manure, capital, loans" size="lg" />
        <Figure label="Money out" value={c.moneyOut ? out(c.moneyOut) : naira(0)} sub={`${kinds} ${kinds === 1 ? "kind" : "kinds"} of spending`} size="lg" />
        <Figure label="Owed to the farm" value={naira(c.owed.total)} sub={`${c.owed.buyers} ${c.owed.buyers === 1 ? "buyer" : "buyers"} — not yet cash`} tone={c.owed.total ? "owed" : undefined} size="lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Rows items={[...c.inRows.map((r) => ({ label: r.label, value: naira(r.value) })), { label: "Money in", value: naira(c.moneyIn), total: true }]} />
          <div className="rounded-lg bg-surface-sunken px-4 py-3">
            <Rows items={[
              ...(c.opening ? [{ label: `Counted on ${shortDate(c.since!.date, false)}`, value: naira(c.opening) }] : []),
              { label: `Money in${from ? ` since ${from}` : ""}`, value: naira(c.moneyIn) },
              { label: "Money out", value: c.moneyOut ? out(c.moneyOut) : naira(0) },
              { label: "Should be on hand", value: naira(c.shouldBeOnHand), total: true },
            ]} />
          </div>
        </div>
        <Rows items={[...c.outRows.map((r) => ({ label: r.label, value: out(r.value) })), { label: "Money out", value: c.moneyOut ? out(c.moneyOut) : naira(0), total: true }]} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
        <span className="text-body text-ink-muted">
          {c.since?.difference ? `Last count was ${naira(Math.abs(c.since.difference))} ${c.since.difference < 0 ? "short" : "over"}. ` : ""}Count the cash box and check the bank balance, then record the difference.
        </span>
        {canReconcile ? <Button icon="check" onClick={onReconcile}>Reconcile cash</Button> : null}
      </div>
    </Panel>
  );
}
