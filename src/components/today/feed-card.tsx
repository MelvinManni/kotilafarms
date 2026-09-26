"use client";
// Today: the latest price per bag of the main feed with its last move, and stock per feed
import { Sparkline } from "@/components/kotila/charts/sparkline";
import { Delta } from "@/components/kotila/delta";
import { Figure } from "@/components/kotila/figure";
import { Panel } from "@/components/kotila/panel";
import { Rows } from "@/components/kotila/rows";
import { useFeedPrices, useFeedStock } from "@/hooks/queries/use-feed";
import { bags } from "@/utils/format/bags";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { priceTrend } from "@/utils/metrics/price-trend";

export function FeedCard() {
  const stock = useFeedStock();
  const rows = stock.data?.rows ?? [];
  const main = rows.find((r) => r.kind === "finisher" && r.lastPrice !== null) ?? rows.find((r) => r.lastPrice !== null);
  const prices = useFeedPrices(main?.feedTypeId);
  if (!main) return null;
  const trend = priceTrend(prices.data ?? []);
  return (
    <Panel title="Feed price" subtitle={`${main.feed} · per bag`} action={{ label: "Record a feed purchase", href: "/feed" }}>
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col items-start gap-1.5">
          <Figure value={naira(main.lastPrice)} size="lg" />
          {trend?.previous && trend.lastMove ? <Delta direction={trend.lastMove > 0 ? "up" : "down"} goodWhen="down">{naira(Math.abs(trend.lastMove))} since {shortDate(trend.previous.date, false)}</Delta> : null}
        </div>
        <Sparkline values={(prices.data ?? []).slice(-6).map((p) => p.pricePerBag)} endTone={trend && trend.lastMove > 0 ? "alert" : undefined} label={`${main.feed} price per bag, last purchases`} />
      </div>
      <Rows items={rows.filter((r) => r.stockBags > 0 || r.daysLeft !== null).map((r) => ({ label: `${r.feed.split(" · ")[0]} in stock`, value: `${bags(Math.max(0, r.stockBags))}${r.daysLeft !== null ? ` · ~${Math.floor(r.daysLeft)} days` : ""}` }))} />
    </Panel>
  );
}
