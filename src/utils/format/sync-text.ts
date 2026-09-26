// Words for each sync state: the pill text and the tooltip that says what to do
import type { SyncState } from "@/types/sync-state";

const entries = (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`;

export function syncText(state: SyncState, pending = 0, lastSynced?: string): string {
  switch (state) {
    case "synced":
      return `All synced${lastSynced ? ` · ${lastSynced}` : ""}`;
    case "syncing":
      return `Sending ${entries(pending)}…`;
    case "offline":
      return `Offline${pending ? ` · ${pending} waiting` : ""}`;
    case "conflict":
      return `${entries(pending)} ${pending === 1 ? "needs" : "need"} a look`;
    case "rejected":
      return `${entries(pending)} couldn't be saved`;
  }
}

export const SYNC_TIPS: Record<SyncState, string> = {
  synced: "Every entry on this device has reached the farm records.",
  syncing: "Entries saved on this device are being sent now.",
  offline: "No signal. Keep working: entries are saved on this device and send by themselves when signal returns.",
  conflict: "Someone changed the same record while you were offline. Open it to choose which version to keep.",
  rejected: "The farm records turned an entry down. Open it to see why and fix it.",
};
