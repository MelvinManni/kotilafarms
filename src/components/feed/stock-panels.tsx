// A panel per feed: bags in the store, days left at the current rate, and who is eating it
import { Figure } from "@/components/kotila/figure";
import { Panel } from "@/components/kotila/panel";
import type { FeedStockRow } from "@/types/feed";
import { bags } from "@/utils/format/bags";
import { naira } from "@/utils/format/naira";
import { RUN_OUT_WARN_DAYS } from "@/utils/metrics/feed-headlines";

function subtitle(r: FeedStockRow) {
  const who = r.eating.length ? r.eating.map((s) => `Set ${s.number}`).join(", ") : "No Set eating it this week";
  return r.lastPrice ? `${who} · ${naira(r.lastPrice)} a bag last paid` : who;
}

export function StockPanels({ rows }: { rows: FeedStockRow[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => {
        const low = r.daysLeft !== null && r.daysLeft <= RUN_OUT_WARN_DAYS;
        const sub = r.daysLeft !== null ? `~${Math.floor(r.daysLeft)} days at ${bags(r.bagsPerDay)} a day` : r.stockBags < 0 ? "More logged as used than bought — check purchases" : "Not being used this week";
        return (
          <Panel key={r.feedTypeId} title={r.feed} subtitle={subtitle(r)}>
            <Figure value={bags(r.stockBags)} sub={sub} tone={low || r.stockBags < 0 ? "alert" : undefined} />
          </Panel>
        );
      })}
    </div>
  );
}
