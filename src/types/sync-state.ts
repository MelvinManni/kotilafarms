// Connection and sync state shown to people
export type SyncState = "synced" | "syncing" | "offline" | "conflict" | "rejected";

export type SyncSummary = { state: SyncState; pending?: number; lastSynced?: string };
