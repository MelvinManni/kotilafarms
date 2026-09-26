// An entry waiting on this device to reach the farm records (docs/07-offline-sync.md › Outbox)
import type { MutationType } from "@/schemas/sync";

export type OutboxStatus = "pending" | "sending" | "sent" | "conflict" | "rejected";

export type OutboxItem = {
  mutationId: string;
  clientId: string;
  type: MutationType;
  payload: Record<string, unknown>;
  userId: string;
  createdAt: string;
  // Insertion order; createdAt alone can tie within one millisecond
  order: number;
  enteredOfflineAt?: string;
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: string;
  sendingSince?: string;
  serverId?: string;
  conflictId?: string;
  error?: { code: string; message: string };
  sentAt?: string;
};
