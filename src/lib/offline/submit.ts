// Save through the outbox, then try to send straight away; the answer never waits on a missing network
import { enqueue } from "@/lib/offline/outbox";
import { onOutboxChange } from "@/lib/offline/outbox-events";
import { listOutbox } from "@/lib/offline/outbox";
import type { OutboxItem } from "@/lib/offline/outbox-types";
import { syncNow } from "@/lib/offline/sync-worker";

export type Submitted = { item: OutboxItem; state: "sent" | "on-phone" | "conflict" | "rejected" };

const stateOf = (item: OutboxItem): Submitted["state"] =>
  item.status === "sent" ? "sent" : item.status === "conflict" ? "conflict" : item.status === "rejected" ? "rejected" : "on-phone";

// Wait a little for another tab's runner to send it
function settle(item: OutboxItem, ms: number): Promise<OutboxItem> {
  return new Promise((resolve) => {
    const done = async () => {
      const now = (await listOutbox(item.userId)).find((i) => i.mutationId === item.mutationId) ?? item;
      if (now.status !== "pending" && now.status !== "sending") finish(now);
    };
    const timer = setTimeout(async () => finish((await listOutbox(item.userId)).find((i) => i.mutationId === item.mutationId) ?? item), ms);
    const stop = onOutboxChange(() => void done());
    const finish = (value: OutboxItem) => {
      clearTimeout(timer);
      stop();
      resolve(value);
    };
  });
}

export async function submitViaOutbox(entry: Parameters<typeof enqueue>[0]): Promise<Submitted> {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  const item = await enqueue({ ...entry, enteredOfflineAt: offline ? new Date().toISOString() : undefined });
  if (offline) return { item, state: "on-phone" };
  const { outcome } = await syncNow(entry.userId);
  const latest = outcome === "busy" ? await settle(item, 6_000) : ((await listOutbox(entry.userId)).find((i) => i.mutationId === item.mutationId) ?? item);
  return { item: latest, state: stateOf(latest) };
}
