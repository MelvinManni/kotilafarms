"use client";
// Invite someone (or reset a password): name, email, role → a link to share
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { InviteLink } from "@/components/settings/invite-link";
import { Button } from "@/components/kotila/button";
import { Segmented } from "@/components/kotila/segmented";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { TextInput } from "@/components/kotila/fields/text-input";
import { useCreateInvite } from "@/hooks/queries/use-invite";
import { inviteCreateSchema, type InviteCreateInput } from "@/schemas/auth";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "recorder", label: "Recorder" },
];

export function InviteSheet({ onClose }: { onClose: () => void }) {
  const invite = useCreateInvite();
  const form = useForm<InviteCreateInput>({ resolver: zodResolver(inviteCreateSchema), defaultValues: { name: "", email: "", role: "recorder" } });
  const submit = form.handleSubmit((values) => invite.mutate(values));
  const done = invite.data;
  return (
    <Sheet
      title="Invite someone"
      description="There's no sign-up. The link you send is how they set their password. Inviting someone who already has an account sends them a password reset."
      onClose={onClose}
      footer={
        done ? (
          <Button variant="primary" onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={invite.isPending}>Make invite link</Button>
          </>
        )
      }
    >
      {done ? (
        <InviteLink name={form.getValues("name")} url={`${window.location.origin}${done.path}`} isReset={done.isReset} />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {invite.error ? <Notice tone="alert" compact>{invite.error.message}</Notice> : null}
          <Controller control={form.control} name="name" render={({ field, fieldState }) => <TextInput label="Name" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => <TextInput label="Email" type="email" autoComplete="off" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />}
          />
          <Controller control={form.control} name="role" render={({ field }) => <Segmented label="Role" options={ROLES} value={field.value} onChange={field.onChange} />} />
        </form>
      )}
    </Sheet>
  );
}
