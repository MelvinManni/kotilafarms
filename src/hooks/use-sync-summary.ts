// What SyncStatus shows: offline, sending, entries turned down or clashing, or all synced
import { useSyncExternalStore } from "react";
import { unsent, useOutboxItems } from "@/hooks/use-outbox-items";
import { useOnline } from "@/hooks/use-online";
import { syncActivity } from "@/lib/offline/sync-activity";
import type { SyncSummary } from "@/types/sync-state";
import { lastActive } from "@/utils/format/last-active";

// `openConflicts`: days logged twice on the farm that a manager can settle
export function useSyncSummary(userId: string, openConflicts = 0): SyncSummary {
  const online = useOnline();
  const items = useOutboxItems(userId);
  const activity = useSyncExternalStore(syncActivity.subscribe, syncActivity.get, syncActivity.get);
  const waiting = unsent(items).length;
  const rejected = items.filter((i) => i.status === "rejected").length;
  const conflicts = items.filter((i) => i.status === "conflict").length + openConflicts;
  if (!online) return { state: "offline", pending: waiting };
  if (activity.sending && waiting) return { state: "syncing", pending: waiting };
  if (rejected) return { state: "rejected", pending: rejected };
  if (conflicts) return { state: "conflict", pending: conflicts };
  if (waiting) return { state: "offline", pending: waiting };
  return { state: "synced", lastSynced: activity.lastSyncedAt ? lastActive(activity.lastSyncedAt).replace("Today, ", "") : undefined };
}
