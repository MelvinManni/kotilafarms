"use client";
// Dev preview: notices, empty state, sync status
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { SyncStatus } from "@/components/kotila/sync-status";
import { PreviewSection } from "@/components/dev/preview-section";

export function NoticesPreview() {
  return (
    <PreviewSection title="Notices and sync">
      <Notice tone="owed" title="₦412,000 is owed by 3 buyers" action={{ label: "See balances", href: "#" }}>Mama Nkechi has owed ₦215,000 for 19 days.</Notice>
      <Notice tone="warning" icon="calendar-x" title="Set 5 has no log for Friday" action={{ label: "Fill in Friday", variant: "outline" }}>Logs for missed days record both the day and when they were entered.</Notice>
      <Notice tone="alert" title="Gumboro for Set 5 is due tomorrow">Day 7 of age. Give it in the morning, before feeding.</Notice>
      <Notice tone="success" compact title="Cash reconciled">Counted ₦1,284,750, matches the books.</Notice>
      <Notice tone="neutral" compact icon="wifi-off">Saved on this phone · will send when signal returns</Notice>
      <div className="flex flex-wrap gap-3">
        <SyncStatus state="synced" lastSynced="2 min ago" />
        <SyncStatus state="offline" pending={3} />
        <SyncStatus state="syncing" pending={3} />
        <SyncStatus state="conflict" pending={1} />
        <SyncStatus state="rejected" pending={1} />
      </div>
      <EmptyState title="No weights for Set 5 yet" icon="scale" action={{ label: "Weigh 10 birds", icon: "scale", href: "#" }}>
        Weigh at least 10 birds from different corners each week — it&apos;s the only way to see a growth problem while there&apos;s still time to fix it.
      </EmptyState>
    </PreviewSection>
  );
}
