"use client";
// Settings › Activity: who did what on the farm records, newest first
import { useState } from "react";
import { ActivityFilters } from "@/components/settings/activity-filters";
import { ActivityList } from "@/components/settings/activity-list";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { useActivity, type ActivityFilters as Filters } from "@/hooks/queries/use-activity";
import { useUsers } from "@/hooks/queries/use-users";

export function ActivityScreen() {
  const [filters, setFilters] = useState<Filters>({});
  const people = useUsers();
  const feed = useActivity(filters);
  const items = feed.data?.pages.flatMap((p) => p.items) ?? [];
  const filtered = Object.values(filters).some(Boolean);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Only owners see this page" title="Settings" />
      <SettingsTabs active="activity" role="owner" />
      <Panel title="Filter">
        <ActivityFilters value={filters} people={people.data ?? []} onChange={setFilters} />
      </Panel>
      <Panel flush title="Activity" subtitle="Every change to the records, and every sign-in, newest first.">
        {feed.isPending ? <p className="px-6 pb-6 text-body text-ink-muted">Loading activity…</p> : null}
        {feed.isError ? (
          <div className="px-6 pb-6">
            <Notice tone="alert" compact action={{ label: "Try again", onClick: () => feed.refetch() }}>{feed.error.message}</Notice>
          </div>
        ) : null}
        {feed.data && !items.length ? (
          <p className="m-0 px-6 pb-6 text-body text-ink-muted">
            {filtered ? "Nothing matches these filters. Try a wider day range or Everyone." : "Nothing yet. Changes and sign-ins show here as people use the app."}
          </p>
        ) : null}
        {items.length ? <ActivityList items={items} /> : null}
        {feed.hasNextPage ? (
          <div className="border-t border-line px-6 py-4">
            <Button onClick={() => feed.fetchNextPage()} disabled={feed.isFetchingNextPage}>{feed.isFetchingNextPage ? "Loading…" : "Show older"}</Button>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
