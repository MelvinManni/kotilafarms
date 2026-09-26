// This person's outbox entries, kept up to date as they are added and sent
import { useEffect, useState } from "react";
import { listOutbox } from "@/lib/offline/outbox";
import { onOutboxChange } from "@/lib/offline/outbox-events";
import type { OutboxItem } from "@/lib/offline/outbox-types";

export function useOutboxItems(userId: string): OutboxItem[] {
  const [items, setItems] = useState<OutboxItem[]>([]);
  useEffect(() => {
    let live = true;
    const load = () => void listOutbox(userId).then((list) => live && setItems(list)).catch(() => undefined);
    load();
    const stop = onOutboxChange(load);
    return () => {
      live = false;
      stop();
    };
  }, [userId]);
  return items;
}

// Entries not yet on the server (waiting or on their way)
export const unsent = (items: OutboxItem[]) => items.filter((i) => i.status === "pending" || i.status === "sending");
