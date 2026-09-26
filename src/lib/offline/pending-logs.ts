// Daily logs still on this phone for one Set, by day, so lists and the form can show them
import type { OutboxItem } from "@/lib/offline/outbox-types";

export type PendingLog = { clientId: string; status: OutboxItem["status"]; payload: Record<string, unknown> };

export function pendingLogsFor(items: OutboxItem[], setId: string): Map<string, PendingLog> {
  const out = new Map<string, PendingLog>();
  for (const i of items) {
    if (i.type !== "dailyLog.upsert" || i.payload.setId !== setId) continue;
    if (i.status !== "pending" && i.status !== "sending") continue;
    out.set(String(i.payload.date), { clientId: i.clientId, status: i.status, payload: i.payload });
  }
  return out;
}
