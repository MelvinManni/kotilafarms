"use client";
// Expenses as a ledger on desktop and as rows on phones; a row opens the expense
import { LedgerTable } from "@/components/kotila/ledger-table";
import { ExpensePhoneRows } from "@/components/expenses/expense-phone-rows";
import type { ExpenseRow } from "@/types/expense";
import { farmDay } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

const attribution = (e: ExpenseRow) =>
  e.capitalItem
    ? { tag: { tone: "deep" as const, label: "Capital item" }, sub: e.overhead ? "Farm overhead" : `Set ${e.setNumber}` }
    : e.overhead
      ? { tag: { tone: "neutral" as const, label: "Overhead" } }
      : { tag: { tone: "success" as const, label: `Set ${e.setNumber}` } };

const columns = [
  { key: "what", label: "What for" },
  { key: "set", label: "Set or overhead" },
  { key: "amount", label: "Amount", align: "right" as const },
  { key: "by", label: "Paid by" },
  { key: "receipt", label: "Receipt" },
];

// The screen above already filters by Set, category and month
const FILTERS = [
  { key: "by", label: "Paid by" },
  { key: "proof", label: "Receipt" },
];

export function ExpenseList({ rows, onOpen }: { rows: ExpenseRow[]; onOpen: (e: ExpenseRow) => void }) {
  const table = rows.map((e) => ({
    id: e.id,
    what: { value: e.description, sub: `${farmDay(e.date)} · ${e.category.name}` },
    set: attribution(e),
    amount: e.possibleDuplicateOf ? { value: naira(e.amount), sub: "looks like a repeat", tone: "alert" as const } : naira(e.amount),
    by: e.paidBy?.name.split(" ")[0] ?? e.createdBy.split(" ")[0],
    proof: e.receiptKey ? "With a receipt" : "No receipt",
    receipt: e.receiptKey ? { tag: { tone: "success" as const, label: "Receipt" } } : { value: "None", tone: "muted" as const },
  }));
  const byId = new Map(rows.map((e) => [e.id, e]));
  return (
    <LedgerTable
      dense
      caption="Expenses, newest first"
      columns={columns}
      rows={table}
      filters={FILTERS}
      onRowClick={(r) => onOpen(byId.get(r.id)!)}
      phone={(shown) => <ExpensePhoneRows rows={shown.map((r) => byId.get(r.id)!)} onOpen={onOpen} />}
    />
  );
}
