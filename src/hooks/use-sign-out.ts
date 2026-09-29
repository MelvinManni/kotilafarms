"use client";
// Sign out: clears this person's cached pages and data; unsent entries stay on the phone
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { unsent, useOutboxItems } from "@/hooks/use-outbox-items";
import { forgetUser } from "@/lib/offline/remembered-user";
import { queryPersister } from "@/lib/query/persister";

export function useSignOut(userId: string) {
  const client = useQueryClient();
  const waiting = unsent(useOutboxItems(userId)).length;
  const leave = async () => {
    // Waiting entries stay on this phone and send after this person signs in again
    if (!waiting) forgetUser();
    client.clear();
    await queryPersister.removeClient();
    // Pages cached for offline belong to this person; the app's own files can stay
    if ("caches" in window) for (const key of await caches.keys()) if (!key.includes("precache")) await caches.delete(key);
    await signOut({ callbackUrl: "/sign-in" });
  };
  return { waiting, signOut: leave };
}
