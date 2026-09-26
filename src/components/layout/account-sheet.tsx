"use client";
// Who is signed in, and signing out: warns first if entries haven't reached the farm records yet
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Person } from "@/components/kotila/person";
import { Sheet } from "@/components/kotila/sheet";
import { unsent, useOutboxItems } from "@/hooks/use-outbox-items";
import { forgetUser } from "@/lib/offline/remembered-user";
import { queryPersister } from "@/lib/query/persister";
import type { SessionUser } from "@/types/session";

export function AccountSheet({ user, onClose }: { user: SessionUser; onClose: () => void }) {
  const client = useQueryClient();
  const waiting = unsent(useOutboxItems(user.id)).length;
  const leave = async () => {
    // Waiting entries stay on this phone and send after this person signs in again
    if (!waiting) forgetUser();
    client.clear();
    await queryPersister.removeClient();
    // Pages cached for offline belong to this person; the app's own files can stay
    if ("caches" in window) for (const key of await caches.keys()) if (!key.includes("precache")) await caches.delete(key);
    await signOut({ callbackUrl: "/sign-in" });
  };
  return (
    <Sheet
      variant="sheet"
      title="Your account"
      onClose={onClose}
      footer={
        <>
          {waiting ? <Button onClick={onClose}>Stay signed in</Button> : null}
          <Button variant="danger" onClick={() => void leave()}>{waiting ? "Sign out anyway" : "Sign out"}</Button>
        </>
      }
    >
      <Person name={user.name} role={user.role} size="lg" />
      <p className="m-0 text-body text-ink-muted">{user.email}</p>
      {waiting ? (
        <Notice tone="warning" icon="wifi-off" title={`${waiting} ${waiting === 1 ? "entry hasn’t" : "entries haven’t"} reached the farm records`}>
          They stay on this phone and send the next time you sign in with signal. Nobody else can sign in here until they have.
        </Notice>
      ) : null}
    </Sheet>
  );
}
