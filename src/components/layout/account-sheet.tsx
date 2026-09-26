"use client";
// Who is signed in, and signing out (which also forgets them for offline use)
import { signOut } from "next-auth/react";
import { Button } from "@/components/kotila/button";
import { Person } from "@/components/kotila/person";
import { Sheet } from "@/components/kotila/sheet";
import { forgetUser } from "@/lib/offline/remembered-user";
import type { SessionUser } from "@/types/session";

export function AccountSheet({ user, onClose }: { user: SessionUser; onClose: () => void }) {
  const leave = () => {
    forgetUser();
    void signOut({ callbackUrl: "/sign-in" });
  };
  return (
    <Sheet
      variant="sheet"
      title="Your account"
      onClose={onClose}
      footer={
        <Button variant="danger" onClick={leave}>
          Sign out
        </Button>
      }
    >
      <Person name={user.name} role={user.role} size="lg" />
      <p className="m-0 text-body text-ink-muted">{user.email}</p>
    </Sheet>
  );
}
