"use client";
// Email and password sign-in; errors say what happened and what to do
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRememberedUser } from "@/hooks/use-remembered-user";
import { unsent, useOutboxItems } from "@/hooks/use-outbox-items";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/kotila/button";
import { PasswordInput } from "@/components/kotila/fields/password-input";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { signInWithPassword } from "@/lib/auth/sign-in-with-password";
import { signInSchema, type SignInInput } from "@/schemas/auth";

const MESSAGES: Record<string, string> = {
  CredentialsSignin: "That email and password don't match an active account.",
  rate_limited: "Too many tries. Wait 15 minutes, then try again.",
  db_unavailable: "Sign-in isn't working right now: the app can't reach its database. Try again in a few minutes.",
};

export function SignInForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  // A tap before the page is ready would reload it and lose what was typed
  const hydrated = useHydrated();
  // Someone else's entries still on this phone must send before anyone else signs in here
  const remembered = useRememberedUser();
  const theirs = unsent(useOutboxItems(remembered?.id ?? "nobody")).length;
  const form = useForm<SignInInput>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });

  const submit = form.handleSubmit(async (values) => {
    setError(null);
    if (theirs && remembered && values.email.trim().toLowerCase() !== remembered.email.toLowerCase()) {
      const first = remembered.name.split(" ")[0];
      return setError(`${first}’s ${theirs} ${theirs === 1 ? "entry hasn’t" : "entries haven’t"} been sent yet. Sign in as ${first} with signal and wait for “All synced” first.`);
    }
    try {
      const res = await signInWithPassword(values.email, values.password);
      if (res.ok) return router.replace(next?.startsWith("/") ? next : "/today");
      setError(MESSAGES[res.error] ?? "Signing in didn't work. Try again.");
    } catch {
      setError("No signal. Signing in needs a connection.");
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex w-full max-w-105 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="m-0 font-display text-display font-semibold tracking-[-0.02em]">Sign in</h2>
        <p className="m-0 text-base text-ink-muted">Use the email an owner set up for you.</p>
      </div>
      {error ? <Notice tone="alert" compact>{error}</Notice> : null}
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <TextInput label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            hint={showHelp ? "Ask an owner to send you a reset link from Settings › Users." : undefined}
            aside={
              <button type="button" onClick={() => setShowHelp(true)} className="cursor-pointer text-sm font-semibold text-green-700 hover:text-green-800">
                Forgot password?
              </button>
            }
          />
        )}
      />
      <Button type="submit" variant="primary" size="lg" full disabled={!hydrated || form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
      <div className="h-px bg-line" />
      <p className="m-0 text-sm leading-relaxed text-ink-muted">
        No account? There’s no sign-up — an owner adds each person and chooses their role: owner, manager or recorder.
      </p>
    </form>
  );
}
