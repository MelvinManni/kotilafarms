"use client";
// Running Sets at a glance: age, live birds, mortality, deaths this week vs last, spend
import { useRouter } from "next/navigation";
import { LedgerTable } from "@/components/kotila/ledger-table";
import type { SetSummary } from "@/types/sets";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";

export function ActiveSetsTable({ sets }: { sets: SetSummary[] }) {
  const router = useRouter();
  const money = sets.some((s) => s.money);
  const rows = sets.map((s) => ({
    id: s.id,
    set: { value: `Set ${s.number}${s.pen ? ` · ${s.pen}` : ""}`, sub: s.status[0]!.toUpperCase() + s.status.slice(1) },
    age: `Day ${s.dayOfAge}`,
    live: { value: count(s.liveBirds), sub: `of ${count(s.intake)} started` },
    mort: { value: pct(s.mortalityRate), sub: `${count(s.deaths)} birds` },
    week: {
      value: String(s.trend.thisWeek),
      tone: s.trend.thisWeek > s.trend.lastWeek ? ("alert" as const) : undefined,
      sub: s.dayOfAge < 7 ? "first week" : `${s.trend.lastWeek} last week`,
    },
    spend: s.money ? naira(s.money.spend) : "—",
  }));
  return (
    <LedgerTable
      caption="Active Sets"
      columns={[
        { key: "set", label: "Set" },
        { key: "age", label: "Age" },
        { key: "live", label: "Live birds", align: "right" },
        { key: "mort", label: "Mortality", align: "right" },
        { key: "week", label: "Deaths this week", align: "right" },
        ...(money ? [{ key: "spend", label: "Spend to date", align: "right" as const }] : []),
      ]}
      rows={rows}
      onRowClick={(r) => router.push(`/sets/${r.id}`)}
    />
  );
}
