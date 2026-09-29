"use client";
// Change your own password: current, new, and new again
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/kotila/button";
import { PasswordInput } from "@/components/kotila/fields/password-input";
import { Notice } from "@/components/kotila/notice";
import { useChangePassword } from "@/hooks/queries/use-change-password";
import { useHydrated } from "@/hooks/use-hydrated";
import { ApiRequestError } from "@/lib/query/fetcher";
import { passwordChangeSchema, type PasswordChangeInput } from "@/schemas/auth";

const FIELDS = [
  { name: "current", label: "Current password", autoComplete: "current-password" },
  { name: "password", label: "New password", autoComplete: "new-password", hint: "At least 10 characters" },
  { name: "confirm", label: "New password again", autoComplete: "new-password" },
] as const;

export function PasswordForm({ submitLabel, onChanged }: { submitLabel: string; onChanged: (password: string) => Promise<void> | void }) {
  const change = useChangePassword();
  const hydrated = useHydrated();
  const form = useForm<PasswordChangeInput>({ resolver: zodResolver(passwordChangeSchema), defaultValues: { current: "", password: "", confirm: "" } });
  const submit = form.handleSubmit(async (values) => {
    try {
      await change.mutateAsync(values);
      form.reset();
      await onChanged(values.password);
    } catch (error) {
      // Field problems from the server go next to the field
      if (error instanceof ApiRequestError) for (const issue of error.issues ?? []) form.setError(issue.path as keyof PasswordChangeInput, { message: issue.message });
    }
  });
  const fieldIssue = change.error instanceof ApiRequestError && change.error.issues?.length;
  return (
    <form onSubmit={submit} noValidate className="flex max-w-105 flex-col gap-5">
      {change.error && !fieldIssue ? <Notice tone="alert" compact>{change.error.message}</Notice> : null}
      {change.isSuccess ? <Notice tone="success" compact>Password changed. Use the new one next time you sign in.</Notice> : null}
      {FIELDS.map((f) => (
        <Controller
          key={f.name}
          control={form.control}
          name={f.name}
          render={({ field, fieldState }) => (
            <PasswordInput label={f.label} autoComplete={f.autoComplete} value={field.value} onChange={field.onChange} error={fieldState.error?.message} hint={"hint" in f ? f.hint : undefined} />
          )}
        />
      ))}
      <Button type="submit" variant="primary" disabled={!hydrated || form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
