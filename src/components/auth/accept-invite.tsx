"use client";
// Invite page body: loading, a used/expired link, or the password form
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { EmptyState } from "@/components/kotila/empty-state";
import { useInvite } from "@/hooks/queries/use-invite";

export function AcceptInvite({ token }: { token: string }) {
  const invite = useInvite(token);
  if (invite.isPending) return <p className="text-body text-ink-muted">Checking your invite…</p>;
  if (invite.isError)
    return (
      <EmptyState title="This link can’t be used" icon="lock" action={{ label: "Go to sign in", icon: "user", href: "/sign-in" }}>
        It has been used already or is more than 7 days old. Ask an owner to send you a new one.
      </EmptyState>
    );
  return <AcceptInviteForm token={token} invite={invite.data} />;
}
