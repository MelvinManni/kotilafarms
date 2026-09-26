"use client";
// Set a password from an invite (or reset link), then sign straight in
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useHydrated } from "@/hooks/use-hydrated";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as z from "zod/mini";
import { RoleAbilities } from "@/components/auth/role-abilities";
import { Button } from "@/components/kotila/button";
import { PasswordInput } from "@/components/kotila/fields/password-input";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { useAcceptInvite, type InviteDetails } from "@/hooks/queries/use-invite";
import { signInWithPassword } from "@/lib/auth/sign-in-with-password";
import { passwordSchema } from "@/schemas/auth";
import { Icon } from "@/svgs/icon";
import { ROLE_LABEL } from "@/types/role";

const formSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .check(z.refine<{ password: string; confirm: string }>((v) => v.password === v.confirm, { message: "The two passwords don't match.", path: ["confirm"] }));

export function AcceptInviteForm({ token, invite }: { token: string; invite: InviteDetails }) {
  const router = useRouter();
  const accept = useAcceptInvite();
  // A tap before the page is ready would reload it and lose what was typed
  const hydrated = useHydrated();
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { password: "", confirm: "" } });
  const longEnough = useWatch({ control: form.control, name: "password" }).length >= 10;

  const submit = form.handleSubmit(async ({ password, confirm }) => {
    const { email } = await accept.mutateAsync({ token, password, confirm });
    const res = await signInWithPassword(email, password);
    router.replace(res.ok ? "/today" : "/sign-in");
  });

  const role = ROLE_LABEL[invite.role].toLowerCase();
  return (
    <form onSubmit={submit} noValidate className="flex w-full max-w-105 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="m-0 font-display text-title-lg font-semibold">
          {invite.isReset ? "Set a new password" : `${invite.invitedBy} added you as ${role === "owner" ? "an" : "a"} ${role}`}
        </h2>
        <p className="m-0 text-body text-ink-muted">{invite.isReset ? "Choose a new password for your account." : "Set a password to finish setting up your account."}</p>
      </div>
      {invite.isReset ? null : <RoleAbilities role={invite.role} />}
      {accept.error ? <Notice tone="alert" compact>{accept.error.message}</Notice> : null}
      <TextInput label="Email" value={invite.email} readOnly />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            hint={
              <span className="flex items-center gap-1.5">
                <Icon name={longEnough ? "check" : "info"} size={16} strokeWidth={2.8} color={longEnough ? "var(--green-600)" : undefined} />
                At least 10 characters
              </span>
            }
          />
        )}
      />
      <Controller
        control={form.control}
        name="confirm"
        render={({ field, fieldState }) => (
          <PasswordInput label="Type it again" autoComplete="new-password" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <Button type="submit" variant="primary" size="lg" full disabled={!hydrated || form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Set password and continue"}
      </Button>
    </form>
  );
}
