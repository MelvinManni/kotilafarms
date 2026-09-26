"use client";
// Expenses as a ledger on desktop and as rows on phones; a row opens the expense
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Tag } from "@/components/kotila/tag";
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

export function ExpenseList({ rows, onOpen }: { rows: ExpenseRow[]; onOpen: (e: ExpenseRow) => void }) {
  const table = rows.map((e) => ({
    id: e.id,
    what: { value: e.description, sub: `${farmDay(e.date)} · ${e.category.name}` },
    set: attribution(e),
    amount: e.possibleDuplicateOf ? { value: naira(e.amount), sub: "looks like a repeat", tone: "alert" as const } : naira(e.amount),
    by: e.paidBy?.name.split(" ")[0] ?? e.createdBy.split(" ")[0],
    receipt: e.receiptKey ? { tag: { tone: "success" as const, label: "Receipt" } } : { value: "None", tone: "muted" as const },
  }));
  return (
    <>
      <div className="hidden lg:block">
        <LedgerTable dense caption="Expenses, newest first" columns={columns} rows={table} onRowClick={(r) => onOpen(rows.find((e) => e.id === r.id)!)} />
      </div>
      <ul className="m-0 flex list-none flex-col p-0 lg:hidden">
        {rows.map((e) => (
          <li key={e.id} className="border-t border-line-soft first:border-t-0">
            <button type="button" onClick={() => onOpen(e)} className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-5 py-3.5 text-left outline-none focus-visible:bg-row-hover">
              <span className="flex min-w-0 grow flex-col gap-1">
                <strong className="truncate text-body font-semibold text-ink">{e.description}</strong>
                <span className="text-caption text-ink-muted">{farmDay(e.date)} · {e.category.name}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <strong className="text-body font-bold tabular-nums">{naira(e.amount)}</strong>
                <Tag tone={e.capitalItem ? "deep" : e.overhead ? "neutral" : "success"}>{e.capitalItem ? "Capital" : e.overhead ? "Overhead" : `Set ${e.setNumber}`}</Tag>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
