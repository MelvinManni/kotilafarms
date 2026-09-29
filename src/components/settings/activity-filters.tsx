"use client";
// Activity filters: person, kind and a day range
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { ACTIVITY_KINDS } from "@/constants/activity-kinds";
import type { ActivityFilters as Filters } from "@/hooks/queries/use-activity";

const ALL = "all";

export function ActivityFilters({ value, people, onChange }: { value: Filters; people: { id: string; name: string }[]; onChange: (next: Filters) => void }) {
  const set = (patch: Filters) => onChange({ ...value, ...patch });
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Select label="Person" options={[{ value: ALL, label: "Everyone" }, ...people.map((p) => ({ value: p.id, label: p.name }))]} value={value.person ?? ALL} onChange={(v) => set({ person: v === ALL ? undefined : v })} />
      <Select label="What" options={[{ value: ALL, label: "Everything" }, ...ACTIVITY_KINDS.map((k) => ({ value: k.value, label: k.label }))]} value={value.kind ?? ALL} onChange={(v) => set({ kind: v === ALL ? undefined : v })} />
      <TextInput label="From" type="date" value={value.from ?? ""} onChange={(v) => set({ from: v || undefined })} />
      <TextInput label="To" type="date" value={value.to ?? ""} onChange={(v) => set({ to: v || undefined })} />
    </div>
  );
}
