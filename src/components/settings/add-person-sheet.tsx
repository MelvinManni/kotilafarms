"use client";
// Add someone: name, email, role → the app makes a password and emails it
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StartingPassword } from "@/components/settings/starting-password";
import { Button } from "@/components/kotila/button";
import { Segmented } from "@/components/kotila/segmented";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { TextInput } from "@/components/kotila/fields/text-input";
import { useAddPerson } from "@/hooks/queries/use-people";
import { personCreateSchema, type PersonCreateInput } from "@/schemas/auth";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "recorder", label: "Recorder" },
];

export function AddPersonSheet({ onClose }: { onClose: () => void }) {
  const add = useAddPerson();
  const form = useForm<PersonCreateInput>({ resolver: zodResolver(personCreateSchema), defaultValues: { name: "", email: "", role: "recorder" } });
  const submit = form.handleSubmit((values) => add.mutate(values));
  return (
    <Sheet
      title="Add someone"
      description="The app makes a password and emails it with the sign-in link and the how-to video. They choose their own password when they first sign in."
      onClose={onClose}
      footer={
        add.data ? (
          <Button variant="primary" onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={add.isPending}>{add.isPending ? "Adding…" : "Add and email password"}</Button>
          </>
        )
      }
    >
      {add.data ? (
        <StartingPassword result={add.data} isReset={false} />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {add.error ? <Notice tone="alert" compact>{add.error.message}</Notice> : null}
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
