"use client";
// Settings › Users and roles: the people list, their access, invites, and the role table
import { useSession } from "next-auth/react";
import { useState } from "react";
import { InviteSheet } from "@/components/settings/invite-sheet";
import { PeopleTable } from "@/components/settings/people-table";
import { PersonSheet } from "@/components/settings/person-sheet";
import { RoleMatrixPanel } from "@/components/settings/role-matrix-panel";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { useUsers, type UserRow } from "@/hooks/queries/use-users";

export function UsersScreen() {
  const me = useSession().data?.user;
  const users = useUsers();
  const [inviting, setInviting] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const active = users.data?.filter((u) => u.active).length ?? 0;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={users.data ? `${active} active ${active === 1 ? "person" : "people"} · only owners see this page` : "Only owners see this page"}
        title="Settings"
        actions={<Button variant="primary" icon="plus" onClick={() => setInviting(true)}>Invite someone</Button>}
      />
      <SettingsTabs active="users" role={me?.role ?? "owner"} counts={{ users: users.data?.length ?? 0 }} />
      <Panel flush title="People" subtitle="Everyone who can sign in. Deactivated people keep their name on what they entered.">
        {users.isPending ? <p className="px-6 pb-6 text-body text-ink-muted">Loading people…</p> : null}
        {users.isError ? (
          <div className="px-6 pb-6">
            <Notice tone="alert" compact action={{ label: "Try again", onClick: () => users.refetch() }}>{users.error.message}</Notice>
          </div>
        ) : null}
        {users.data ? <PeopleTable people={users.data} meId={me?.id ?? ""} onSelect={setSelected} /> : null}
      </Panel>
      <RoleMatrixPanel />
      {inviting ? <InviteSheet onClose={() => setInviting(false)} /> : null}
      {selected ? <PersonSheet person={selected} isMe={selected.id === me?.id} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
