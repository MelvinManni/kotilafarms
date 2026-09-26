"use client";
// Settings › Feed types
import { useState } from "react";
import { FeedTypeSheet } from "@/components/settings/feed-type-sheet";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/kotila/button";
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { useAllFeedTypes, type FeedType } from "@/hooks/queries/use-feed-types";
import { useCurrentUser } from "@/lib/auth/current-user";
import { decimal } from "@/utils/format/decimal";
import { feedName } from "@/utils/format/feed-name";

export function FeedTypesScreen() {
  const role = useCurrentUser().role;
  const feeds = useAllFeedTypes();
  const [sheet, setSheet] = useState<{ feed?: FeedType } | null>(null);
  const rows = (feeds.data ?? []).map((f) => ({ id: f.id, name: feedName(f), bag: `${decimal(f.kgPerBag, f.kgPerBag % 1 ? 1 : 0)} kg`, status: f.active ? { tag: { tone: "success" as const, label: "Bought now" } } : { value: "Retired", tone: "muted" as const } }));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" actions={<Button variant="primary" icon="plus" onClick={() => setSheet({})}>Add a feed</Button>} />
      <SettingsTabs active="feed" role={role} />
      {feeds.isError ? <Notice tone="alert">{feeds.error.message}</Notice> : null}
      <Panel flush title="Feed types" subtitle={feeds.data?.length === 0 ? "No feeds yet. Add the starter, grower and finisher you buy." : "Select a feed to change it."}>
        {feeds.data?.length ? (
          <LedgerTable caption="Feed types" columns={[{ key: "name", label: "Feed" }, { key: "bag", label: "Bag size", align: "right" }, { key: "status", label: "", align: "right" }]} rows={rows} onRowClick={(r) => setSheet({ feed: feeds.data!.find((f) => f.id === r.id) })} />
        ) : null}
      </Panel>
      {sheet ? <FeedTypeSheet feed={sheet.feed} onClose={() => setSheet(null)} /> : null}
    </div>
  );
}
