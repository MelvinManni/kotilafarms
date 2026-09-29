"use client";
// One ledger row; a tap opens it, but not a tap on a control inside it or the end of a drag
import { useRef, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { LedgerCell } from "@/components/kotila/ledger-cell";
import { FrozenColumnFade } from "@/components/kotila/table/frozen-column-fade";
import { ALIGN, EDGE, PINNED } from "@/components/kotila/table/ledger-classes";
import type { LedgerColumn, LedgerRow } from "@/types/ledger";
import { ROW_CLICK_IGNORE_SELECTOR, shouldActivateRow, type RowClickPoint } from "@/utils/table/row-click";
import { cn } from "@/utils/cn";

type LedgerBodyRowProps<R extends LedgerRow> = {
  row: R;
  columns: LedgerColumn[];
  dense?: boolean;
  faded: boolean;
  onOpen?: (row: R) => void;
};

const onControl = (target: EventTarget) => target instanceof Element && target.closest(ROW_CLICK_IGNORE_SELECTOR) !== null;

export function LedgerBodyRow<R extends LedgerRow>({ row, columns, dense, faded, onOpen }: LedgerBodyRowProps<R>) {
  const press = useRef<RowClickPoint | null>(null);
  const handlers = onOpen
    ? {
        tabIndex: 0,
        onPointerDown: (e: PointerEvent) => {
          press.current = onControl(e.target) ? null : { x: e.clientX, y: e.clientY };
        },
        onClick: (e: MouseEvent) => {
          if (onControl(e.target)) return;
          const start = press.current;
          press.current = null;
          if (shouldActivateRow(start, { x: e.clientX, y: e.clientY })) onOpen(row);
        },
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" && e.target === e.currentTarget) onOpen(row);
        },
      }
    : {};
  return (
    <TableRow {...handlers} className={cn("group/row border-b border-line-soft last:border-b-0 hover:bg-transparent", onOpen && "cursor-pointer outline-none")}>
      {columns.map((c, i) => (
        <TableCell
          key={c.key}
          className={cn(
            "bg-surface px-4 align-middle whitespace-normal",
            dense ? "py-2.5" : "py-3.5",
            EDGE,
            ALIGN[c.align ?? "left"],
            onOpen && "group-hover/row:bg-row-hover group-focus-visible/row:bg-row-hover",
            i === 0 && cn(PINNED, "z-1"),
          )}
        >
          <LedgerCell cell={row[c.key]} />
          {i === 0 && faded ? <FrozenColumnFade /> : null}
        </TableCell>
      ))}
    </TableRow>
  );
}
