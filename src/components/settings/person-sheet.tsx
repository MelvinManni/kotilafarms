"use client";
// Change one person's role, or deactivate / reactivate them
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Person } from "@/components/kotila/person";
import { Segmented } from "@/components/kotila/segmented";
import { Sheet } from "@/components/kotila/sheet";
import { useUpdateUser, type UserRow } from "@/hooks/queries/use-users";
import type { Role } from "@/types/role";

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "recorder", label: "Recorder" },
];

export function PersonSheet({ person, isMe, onClose }: { person: UserRow; isMe: boolean; onClose: () => void }) {
  const [role, setRole] = useState<Role>(person.role);
  const update = useUpdateUser();
  const save = (change: { role?: Role; active?: boolean }) => update.mutate({ id: person.id, ...change }, { onSuccess: onClose });
  return (
    <Sheet
      title={`${person.name.split(" ")[0]}'s access`}
      description="Changes apply within 5 minutes, even on a phone that's already signed in."
      onClose={onClose}
      footer={
        <>
          {person.active ? (
            isMe ? null : (
              <Button variant="danger" onClick={() => save({ active: false })} disabled={update.isPending}>
                Deactivate
              </Button>
            )
          ) : (
            <Button onClick={() => save({ active: true })} disabled={update.isPending}>
              Reactivate
            </Button>
          )}
          <Button variant="primary" onClick={() => save({ role })} disabled={update.isPending || role === person.role}>
            Save role
          </Button>
        </>
      }
    >
      <Person name={person.name} meta={person.email} size="lg" />
      {update.error ? <Notice tone="alert" compact>{update.error.message}</Notice> : null}
      <Segmented label="Role" options={ROLES} value={role} onChange={(v) => setRole(v as Role)} />
      {person.active ? null : <Notice compact>Deactivated people can’t sign in. Their name stays on what they entered.</Notice>}
    </Sheet>
  );
}
