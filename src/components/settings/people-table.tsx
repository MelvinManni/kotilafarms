"use client";
// Everyone who can sign in: role, last active, status; a row opens their access sheet
import { LedgerTable } from "@/components/kotila/ledger-table";
import type { UserRow } from "@/hooks/queries/use-users";
import { ROLE_LABEL } from "@/types/role";
import { lastActive } from "@/utils/format/last-active";

const ROLE_TONE = { owner: "deep", manager: "success", recorder: "neutral" } as const;

const columns = [
  { key: "person", label: "Person" },
  { key: "role", label: "Role" },
  { key: "last", label: "Last active" },
  { key: "status", label: "Status" },
];

export function PeopleTable({ people, meId, onSelect }: { people: UserRow[]; meId: string; onSelect: (person: UserRow) => void }) {
  const rows = people.map((p) => ({
    id: p.id,
    person: { value: p.name, sub: p.id === meId ? `${p.email} · you` : p.email, tone: p.active ? undefined : ("muted" as const) },
    role: p.active ? { tag: { tone: ROLE_TONE[p.role], label: ROLE_LABEL[p.role] } } : { value: ROLE_LABEL[p.role], tone: "muted" as const },
    last: { value: lastActive(p.lastActiveAt), tone: p.active ? undefined : ("muted" as const) },
    status: p.active ? { tag: { tone: "success" as const, label: "Active" } } : { tag: { tone: "closed" as const, label: "Deactivated" } },
  }));
  return <LedgerTable caption="People with access" columns={columns} rows={rows} onRowClick={(row) => onSelect(people.find((p) => p.id === row.id)!)} />;
}
