"use client";
// Sends the outbox: when signal returns, when the app comes to the front, after each save, and every 60s while work waits
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { onOutboxChange } from "@/lib/offline/outbox-events";
import { readyToSend } from "@/lib/offline/outbox";
import { syncActivity } from "@/lib/offline/sync-activity";
import { syncNow } from "@/lib/offline/sync-worker";

export function SyncRunner({ userId }: { userId: string }) {
  const client = useQueryClient();
  useEffect(() => {
    let stopped = false;
    const run = async () => {
      if (stopped || !navigator.onLine || syncActivity.get().sending) return;
      if (!(await readyToSend(userId)).length) return;
      syncActivity.set({ sending: true });
      const { outcome, results } = await syncNow(userId).catch(() => ({ outcome: "offline" as const, results: [] }));
      syncActivity.set({ sending: false, ...(outcome === "done" ? { lastSyncedAt: new Date().toISOString() } : {}) });
      // Anything that arrived changes counts on every screen
      if (results.length) void client.invalidateQueries();
    };
    const onVisible = () => document.visibilityState === "visible" && void run();
    window.addEventListener("online", run);
    document.addEventListener("visibilitychange", onVisible);
    const stopOutbox = onOutboxChange(() => void run());
    const timer = setInterval(run, 60_000);
    void run();
    return () => {
      stopped = true;
      window.removeEventListener("online", run);
      document.removeEventListener("visibilitychange", onVisible);
      stopOutbox();
      clearInterval(timer);
    };
  }, [userId, client]);
  return null;
}
