"use client";
// /feed: what is in the store and when it runs out, the price per bag, and every purchase
import { useState } from "react";
import { FeedPurchaseSheet } from "@/components/feed/feed-purchase-sheet";
import { IngredientSheet } from "@/components/feed/ingredient-sheet";
import { PricePanel } from "@/components/feed/price-panel";
import { PurchasesTable } from "@/components/feed/purchases-table";
import { StockPanels } from "@/components/feed/stock-panels";
import { Button } from "@/components/kotila/button";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useFeedPurchases, useFeedStock, useIngredientPurchases } from "@/hooks/queries/use-feed";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { runOutNotice, soonestRunOut } from "@/utils/metrics/feed-headlines";
import { storeSummary } from "@/utils/metrics/feed-store";

export function FeedScreen() {
  const stock = useFeedStock();
  const purchases = useFeedPurchases();
  const ingredients = useIngredientPurchases();
  const [sheet, setSheet] = useState<"purchase" | "ingredients" | null>(null);
  const failed = stock.error ?? purchases.error ?? ingredients.error;
  const soon = stock.data ? soonestRunOut(stock.data.rows) : null;
  const warn = soon ? runOutNotice(soon, todayInZone(FARM_TIMEZONE)) : null;
  const nothing = purchases.data?.length === 0 && ingredients.data?.length === 0;
  const buy = () => setSheet("purchase");
  return (
    <>
      <PageHeader
        eyebrow={stock.data ? storeSummary(stock.data.rows) : undefined}
        title="Feed"
        actions={
          <>
            <Button icon="bag" onClick={() => setSheet("ingredients")}>Record ingredients</Button>
            <Button variant="primary" icon="plus" onClick={buy}>Record a feed purchase</Button>
          </>
        }
      />
      {failed ? <Notice tone="alert">{failed.message}</Notice> : null}
      {warn ? <Notice tone="warning" title={warn.title} action={{ label: "Record a feed purchase", onClick: buy }}>{warn.body}</Notice> : null}
      {!stock.data || !purchases.data || !ingredients.data ? (
        failed ? null : <p className="text-body text-on-deep-muted lg:text-ink-muted">Loading feed…</p>
      ) : nothing ? (
        <EmptyState title="No feed bought yet" icon="feed" action={{ label: "Record a feed purchase", icon: "plus", onClick: buy }}>
          Record each purchase with bags, price per bag and total. Stock, run-out warnings and the price trend build from there.
        </EmptyState>
      ) : (
        <>
          <StockPanels rows={stock.data.rows} />
          <PricePanel feeds={stock.data.rows} bagsPer500Birds={stock.data.bagsPer500Birds} />
          <Panel flush title="Purchases">
            <PurchasesTable purchases={purchases.data} ingredients={ingredients.data} />
          </Panel>
        </>
      )}
      {sheet === "purchase" ? <FeedPurchaseSheet onClose={() => setSheet(null)} /> : null}
      {sheet === "ingredients" ? <IngredientSheet onClose={() => setSheet(null)} /> : null}
    </>
  );
}
