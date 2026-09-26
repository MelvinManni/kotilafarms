// What SyncStatus shows. TODO(P1.8): read pending, sending and conflict counts from the outbox
import { useOnline } from "@/hooks/use-online";
import type { SyncSummary } from "@/types/sync-state";

export function useSyncSummary(): SyncSummary {
  const online = useOnline();
  return online ? { state: "synced" } : { state: "offline", pending: 0 };
}
