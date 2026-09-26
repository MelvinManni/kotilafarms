"use client";
// Price per bag for one feed: the change stated, the chart, the latest price and what a ₦1,000 rise costs
import { useState } from "react";
import { PriceChart } from "@/components/kotila/charts/price-chart";
import { Delta } from "@/components/kotila/delta";
import { Figure } from "@/components/kotila/figure";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { Segmented } from "@/components/kotila/segmented";
import { useFeedPrices } from "@/hooks/queries/use-feed";
import type { FeedStockRow } from "@/types/feed";
import { count } from "@/utils/format/count";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { priceHeadline } from "@/utils/metrics/feed-headlines";
import { priceTrend } from "@/utils/metrics/price-trend";

type PricePanelProps = { feeds: FeedStockRow[]; bagsPer500Birds: number | null };

export function PricePanel({ feeds, bagsPer500Birds }: PricePanelProps) {
  const bought = feeds.filter((f) => f.lastPrice !== null);
  const [chosen, setChosen] = useState(() => bought.find((f) => f.kind === "finisher")?.feedTypeId ?? bought[0]?.feedTypeId);
  const feed = bought.find((f) => f.feedTypeId === chosen);
  const prices = useFeedPrices(feed?.feedTypeId);
  if (!feed) return null;
  if (prices.isError) return <Notice tone="alert">{prices.error.message}</Notice>;
  const points = (prices.data ?? []).slice(-6);
  const trend = priceTrend(points);
  const [kind, brand] = feed.feed.split(" · ");
  const h = trend ? priceHeadline(kind!, trend) : { title: `${feed.feed} price per bag`, note: "" };
  const latest = prices.data?.at(-1);
  return (
    <Panel headline title={h.title} subtitle={trend ? `${brand}, ${points.length === 1 ? "one purchase" : `last ${points.length} purchases`}. ${h.note}`.trim() : "Loading prices…"}>
      {bought.length > 1 ? <Segmented label="Feed" options={bought.map((f) => ({ value: f.feedTypeId, label: f.feed }))} value={chosen} onChange={setChosen} /> : null}
      {trend && latest ? (
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <PriceChart points={points} label={`${feed.feed} price per bag over the last ${points.length} purchases, from ${naira(trend.first.pricePerBag)} on ${shortDate(trend.first.date, false)} to ${naira(trend.latest.pricePerBag)} on ${shortDate(trend.latest.date, false)}.`} />
          <div className="flex flex-col gap-4.5 lg:border-l lg:border-line lg:pl-6">
            <div className="flex flex-col items-start gap-1.5">
              <Figure label="Latest price per bag" value={naira(latest.pricePerBag)} sub={`${shortDate(latest.date, false)} · ${latest.supplier}`} size="xl" />
              {trend.previous && trend.lastMove !== 0 ? (
                <Delta direction={trend.lastMove > 0 ? "up" : "down"} goodWhen="down" tooltip={`${naira(trend.previous.pricePerBag)} a bag on ${shortDate(trend.previous.date, false)}, ${naira(latest.pricePerBag)} on ${shortDate(latest.date, false)}.`}>
                  {naira(Math.abs(trend.lastMove))} since {shortDate(trend.previous.date, false)}
                </Delta>
              ) : null}
            </div>
            {bagsPer500Birds ? <Figure label="What a ₦1,000 rise costs a Set" value={naira(bagsPer500Birds * 1000)} sub={`about ${count(bagsPer500Birds)} bags per 500-bird Set`} /> : null}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
