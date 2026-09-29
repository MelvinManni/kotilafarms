"use client";
// Your profile: who you are, change your password, sign out; on first sign-in only the password change
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { Person } from "@/components/kotila/person";
import { PageHeader } from "@/components/layout/page-header";
import { PasswordForm } from "@/components/profile/password-form";
import { SignOutPanel } from "@/components/profile/sign-out-panel";
import { useCurrentUser } from "@/lib/auth/current-user";
import { signInWithPassword } from "@/lib/auth/sign-in-with-password";

export function ProfileScreen({ first }: { first: boolean }) {
  const me = useCurrentUser();
  const gated = first || Boolean(me.mustChangePassword);
  // Signing in again with the new password gives a token without the gate; then a full load into the app
  const changed = async (password: string) => {
    if (!gated) return;
    const res = await signInWithPassword(me.email, password);
    window.location.assign(res.ok ? "/today" : "/sign-in");
  };
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={gated ? "One more step" : "Only you see this page"} title={gated ? "Choose your own password" : "Your profile"} />
      {gated ? (
        <Notice title="Choose your own password to carry on">
          The password in your email was made by the app. Enter it as the current password, then choose one only you know.
        </Notice>
      ) : (
        <Panel title="Your details">
          <Person name={me.name} role={me.role} size="lg" />
          <p className="m-0 text-body text-ink-muted">{me.email}</p>
        </Panel>
      )}
      <Panel title="Change password" subtitle={gated ? undefined : "You'll stay signed in on this device."}>
        <PasswordForm submitLabel={gated ? "Save and continue" : "Change password"} onChanged={changed} />
      </Panel>
      <SignOutPanel userId={me.id} />
    </div>
  );
}
