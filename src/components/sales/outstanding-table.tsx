"use client";
// Every sale with a balance, oldest first, with a heavy total line
import { LedgerTable } from "@/components/kotila/ledger-table";
import type { Outstanding, SaleRow } from "@/types/sale";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

const columns = [
  { key: "buyer", label: "Buyer", width: 240 },
  { key: "set", label: "Set" },
  { key: "total", label: "Sale total", align: "right" as const },
  { key: "paid", label: "Paid", align: "right" as const },
  { key: "bal", label: "Balance", align: "right" as const },
  { key: "age", label: "Owed for", align: "right" as const },
];

export function OutstandingTable({ owed, onOpen }: { owed: Outstanding; onOpen: (sale: SaleRow) => void }) {
  const rows = owed.rows.map((s) => ({
    id: s.id,
    buyer: { value: s.buyer.name, sub: `${s.birds} birds · ${shortDate(s.date, false)}` },
    set: `Set ${s.set.number}`,
    total: naira(s.total),
    paid: naira(s.paid),
    bal: { value: naira(s.balance), tone: "owed" as const, figure: true },
    late: s.daysOwed > 14 ? "Over two weeks" : "Two weeks or less",
    age: { tag: { tone: s.daysOwed > 14 ? ("alert" as const) : ("warning" as const), label: `${s.daysOwed} ${s.daysOwed === 1 ? "day" : "days"}` } },
  }));
  const footer = { buyer: `${owed.buyers} ${owed.buyers === 1 ? "buyer" : "buyers"}`, total: naira(owed.total.sales), paid: naira(owed.total.paid), bal: { value: naira(owed.total.balance), tone: "owed" as const } };
  return <LedgerTable dense caption="Buyers who still owe money" columns={columns} rows={rows} footer={footer} filters={[{ key: "set", label: "Set" }, { key: "late", label: "Owed for" }]} onRowClick={(r) => onOpen(owed.rows.find((s) => s.id === r.id)!)} />;
}
