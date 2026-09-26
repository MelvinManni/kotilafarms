"use client";
// Every Set as a ledger; money columns only when the API sent money
import { useRouter } from "next/navigation";
import { LedgerTable } from "@/components/kotila/ledger-table";
import type { SetSummary } from "@/types/sets";
import { count } from "@/utils/format/count";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";

const muted = { value: "—", tone: "muted" as const };

function row(s: SetSummary) {
  const closed = s.status === "closed";
  return {
    id: s.id,
    set: { value: `Set ${s.number}`, sub: [s.pen, s.name].filter(Boolean).join(" · ") || undefined },
    status: { status: s.status, day: closed ? undefined : s.dayOfAge },
    started: { value: shortDate(s.startDate), sub: closed && s.closedOn ? `closed ${shortDate(s.closedOn, false)}` : `${count(s.intake)} day-olds` },
    birds: closed ? { value: `${count(s.birdsSold)} sold`, sub: `of ${count(s.intake)}` } : { value: `${count(s.liveBirds)} live`, sub: `of ${count(s.intake)}` },
    mort: {
      value: pct(s.mortalityRate),
      sub: `${count(s.deaths)} ${s.deaths === 1 ? "bird" : "birds"}`,
      delta: !closed && s.trend.thisWeek > s.trend.lastWeek ? { direction: "up" as const, label: `${s.trend.thisWeek} this week` } : undefined,
    },
    spend: s.money ? (closed ? naira(s.money.spend) : { value: naira(s.money.spend), sub: "to date" }) : muted,
    rev: s.money && closed ? naira(s.money.revenue) : muted,
    profit: s.money && closed ? { value: naira(s.money.profit), sub: s.money.margin === null ? undefined : `${pct(s.money.margin, 2)} margin` } : muted,
  };
}

export function SetsTable({ sets }: { sets: SetSummary[] }) {
  const router = useRouter();
  const money = sets.some((s) => s.money);
  const columns = [
    { key: "set", label: "Set", width: 200 },
    { key: "status", label: "Status" },
    { key: "started", label: "Started" },
    { key: "birds", label: "Live or sold", align: "right" as const },
    { key: "mort", label: "Mortality", align: "right" as const },
    ...(money
      ? [
          { key: "spend", label: "Spent", align: "right" as const },
          { key: "rev", label: "Revenue", align: "right" as const },
          { key: "profit", label: "Profit", align: "right" as const },
        ]
      : []),
  ];
  return <LedgerTable caption="Every Set, newest first" columns={columns} rows={sets.map(row)} onRowClick={(r) => router.push(`/sets/${r.id}`)} />;
}
