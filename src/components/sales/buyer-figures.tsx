// A buyer's four figures: birds, average per bird against the bulk rate, total bought, still owed
import { Delta } from "@/components/kotila/delta";
import { Figure } from "@/components/kotila/figure";
import { count } from "@/utils/format/count";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { setNames } from "@/utils/format/set-names";
import type { BuyerInsight } from "@/utils/metrics/buyer-insight";

export function BuyerFigures({ b, bulkRate }: { b: BuyerInsight; bulkRate: number | null }) {
  const under = b.vsBulk !== null && b.vsBulk < 0;
  return (
    <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface px-6 py-5 lg:grid-cols-4">
      <Figure label="Birds bought" value={count(b.birds)} sub={`${b.sales} ${b.sales === 1 ? "sale" : "sales"}${b.setNumbers.length ? ` · ${setNames(b.setNumbers)}` : ""}`} />
      <div className="flex flex-col items-start gap-1.5">
        <Figure label="Average per bird" value={b.averagePrice === null ? "—" : naira(b.averagePrice)} />
        {b.vsBulk !== null && b.vsBulk !== 0 ? (
          <Delta direction={under ? "down" : "up"} goodWhen="up" tooltip={bulkRate ? `Bulk rate: ${naira(bulkRate)} a bird` : undefined}>
            {naira(Math.abs(b.vsBulk))} {under ? "under" : "over"} bulk rate
          </Delta>
        ) : null}
      </div>
      <Figure label="Total bought" value={naira(b.total)} sub={b.since ? `since ${shortDate(b.since, false)}` : undefined} />
      <Figure label="Still owes" value={naira(b.owed)} sub={b.oldestOwed ? `from the ${shortDate(b.oldestOwed.date, false)} sale · ${b.oldestOwed.days} days` : "nothing owed"} tone={b.owed > 0 ? "owed" : undefined} />
    </div>
  );
}
