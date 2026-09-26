"use client";
// What is on this phone: waiting to send, turned down (with why), clashing; managers can settle clashes
import { useState } from "react";
import { ConflictsSheet } from "@/components/offline/conflicts-sheet";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { Tag } from "@/components/kotila/tag";
import { useConflicts } from "@/hooks/queries/use-conflicts";
import { useSets } from "@/hooks/queries/use-sets";
import { unsent, useOutboxItems } from "@/hooks/use-outbox-items";
import { useOnline } from "@/hooks/use-online";
import { can } from "@/lib/auth/roles";
import { describeItem } from "@/lib/offline/describe-item";
import { removeItem } from "@/lib/offline/outbox";
import { syncActivity } from "@/lib/offline/sync-activity";
import { syncNow } from "@/lib/offline/sync-worker";
import type { SessionUser } from "@/types/session";

export function SyncSheet({ user, onClose }: { user: SessionUser; onClose: () => void }) {
  const items = useOutboxItems(user.id);
  const online = useOnline();
  const sets = useSets();
  const manager = can.manageOperations(user.role);
  const conflicts = useConflicts(manager);
  const [settling, setSettling] = useState(false);
  const setNumber = (id: string) => sets.data?.find((s) => s.id === id)?.number;
  const waiting = unsent(items);
  const rejected = items.filter((i) => i.status === "rejected");
  const clashing = items.filter((i) => i.status === "conflict");
  const sendNow = async () => {
    syncActivity.set({ sending: true });
    const { outcome } = await syncNow(user.id, { force: true }).catch(() => ({ outcome: "offline" as const }));
    syncActivity.set({ sending: false, ...(outcome === "done" ? { lastSyncedAt: new Date().toISOString() } : {}) });
  };
  if (settling) return <ConflictsSheet onClose={() => setSettling(false)} />;
  return (
    <Sheet variant="sheet" title="On this phone" description={online ? "Entries send by themselves. Nothing here is lost." : "No signal. Keep working: entries are saved here and send when signal returns."} onClose={onClose} footer={<>{online && waiting.length ? <Button variant="primary" icon="sync" onClick={() => void sendNow()}>Send now</Button> : null}<Button onClick={onClose}>Close</Button></>}>
      {waiting.length === 0 && rejected.length === 0 && clashing.length === 0 ? <Notice tone="success" compact>Everything on this phone has reached the farm records.</Notice> : null}
      {waiting.map((i) => (
        <div key={i.mutationId} className="flex items-center justify-between gap-3">
          <span className="text-body">{describeItem(i, setNumber)}</span>
          <Tag dot tone="warning">{i.status === "sending" ? "Sending" : "On this phone"}</Tag>
        </div>
      ))}
      {rejected.map((i) => (
        <Notice key={i.mutationId} tone="alert" title={`${describeItem(i, setNumber)} couldn’t be saved`} action={{ label: "Remove", onClick: () => void removeItem(i.mutationId) }}>
          {i.error?.message ?? "The farm records turned it down."} Enter it again with the fix.
        </Notice>
      ))}
      {clashing.map((i) => (
        <Notice key={i.mutationId} tone="warning" title={`${describeItem(i, setNumber)} was logged by someone else too`} action={{ label: "OK", onClick: () => void removeItem(i.mutationId) }}>
          Your version is kept for a manager, who will choose which one stays.
        </Notice>
      ))}
      {manager && conflicts.data?.length ? (
        <Notice tone="warning" title={`${conflicts.data.length} ${conflicts.data.length === 1 ? "day was" : "days were"} logged twice`} action={{ label: "Settle", onClick: () => setSettling(true) }}>
          Choose which version of each day to keep.
        </Notice>
      ) : null}
    </Sheet>
  );
}
