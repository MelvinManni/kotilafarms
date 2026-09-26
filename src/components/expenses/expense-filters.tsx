"use client";
// Filters: Set (or overhead), category, month, and Set costs vs overhead
import { Select } from "@/components/kotila/fields/select";
import { Segmented } from "@/components/kotila/segmented";
import type { ExpenseFilterState } from "@/hooks/queries/use-expenses";
import type { ExpenseCategory } from "@/types/expense";
import type { SetSummary } from "@/types/sets";

type Props = { value: ExpenseFilterState; onChange: (v: ExpenseFilterState) => void; sets: SetSummary[]; categories: ExpenseCategory[]; months: { value: string; label: string }[] };

export function ExpenseFilters({ value, onChange, sets, categories, months }: Props) {
  const set = (patch: ExpenseFilterState) => onChange({ ...value, ...patch });
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Select label="Set" options={[{ value: "all", label: "All Sets" }, ...sets.map((s) => ({ value: s.id, label: `Set ${s.number}` })), { value: "overhead", label: "Farm overhead" }]} value={value.set ?? "all"} onChange={(v) => set({ set: v === "all" ? undefined : v })} />
      <Select label="Category" options={[{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} value={value.categoryId ?? "all"} onChange={(v) => set({ categoryId: v === "all" ? undefined : v })} />
      <Select label="Month" options={[{ value: "all", label: "Every month" }, ...months]} value={value.month ?? "all"} onChange={(v) => set({ month: v === "all" ? undefined : v })} />
      <Segmented label="Show" options={[{ value: "all", label: "All" }, { value: "sets", label: "Set costs" }, { value: "overhead", label: "Overhead" }]} value={value.show ?? "all"} onChange={(v) => set({ show: v as ExpenseFilterState["show"] })} />
    </div>
  );
}
