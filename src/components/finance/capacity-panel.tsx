// Borrowing capacity: loans outstanding against the agreed share of equity
import { Figure } from "@/components/kotila/figure";
import { Panel } from "@/components/kotila/panel";
import type { CapitalPayload } from "@/types/capital";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { shortDate } from "@/utils/format/dates";
import { capacityLine } from "@/utils/metrics/finance-headlines";
import { cn } from "@/utils/cn";

export function CapacityPanel({ c }: { c: CapitalPayload }) {
  const k = c.capacity;
  const used = k.cap > 0 ? Math.min(1, k.outstanding / k.cap) : 0;
  const open = c.loans.filter((l) => !l.repaidOn);
  const sub = open.length === 1 ? `${open[0]!.lender.name}, since ${shortDate(open[0]!.advancedOn, false)}` : `${open.length} loans`;
  return (
    <Panel title="Borrowing capacity" subtitle={capacityLine(k)}>
      <div className="flex flex-col gap-1.5">
        <div className="h-3 overflow-hidden rounded-full bg-surface-sunken" role="img" aria-label={`${pct(used, 0)} of the cap used`}>
          <div className={cn("h-full rounded-full", k.overCap ? "bg-alert" : "bg-green-600")} style={{ width: `${used * 100}%` }} />
        </div>
        <div className="flex justify-between text-caption text-ink-muted"><span>{naira(0)}</span><span>{pct(used, 0)} used</span><span>Cap {naira(k.cap)}</span></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Figure label="Loans outstanding" value={naira(k.outstanding)} sub={sub} />
        <Figure label="Cap" value={naira(k.cap)} sub={`${pct(k.capPct, 0)} of equity`} />
        <Figure label="Room left" value={naira(Math.max(0, k.headroom))} sub="before the cap" tone={k.overCap ? "alert" : undefined} />
      </div>
    </Panel>
  );
}
