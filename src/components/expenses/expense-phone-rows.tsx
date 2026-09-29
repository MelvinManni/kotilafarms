"use client";
// Expenses on a phone: one tappable row each with amount and where it was spent
import { Tag } from "@/components/kotila/tag";
import type { ExpenseRow } from "@/types/expense";
import { farmDay } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

export function ExpensePhoneRows({ rows, onOpen }: { rows: ExpenseRow[]; onOpen: (e: ExpenseRow) => void }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
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
  );
}
