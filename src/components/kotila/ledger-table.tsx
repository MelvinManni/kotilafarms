"use client";
// Ledger of records: text left, figures right, hairline rows, heavy rule above totals
// Search and filters on top; the first column stays put when the table scrolls sideways
import type { ReactNode } from "react";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LedgerCell } from "@/components/kotila/ledger-cell";
import { FrozenColumnFade } from "@/components/kotila/table/frozen-column-fade";
import { ALIGN, EDGE, HEAD_CELL, PINNED } from "@/components/kotila/table/ledger-classes";
import { LedgerBodyRow } from "@/components/kotila/table/ledger-body-row";
import { LedgerSkeletonRows } from "@/components/kotila/table/ledger-skeleton-rows";
import { NoMatches, NoMatchesRow } from "@/components/kotila/table/no-matches-row";
import { TableToolbar } from "@/components/kotila/table/table-toolbar";
import { useLedgerQuery } from "@/hooks/use-ledger-query";
import { useTableScrollState } from "@/hooks/use-table-scroll-state";
import type { Cell, LedgerColumn, LedgerFilter, LedgerRow } from "@/types/ledger";
import { cn } from "@/utils/cn";

type LedgerTableProps<R extends LedgerRow> = {
  columns: LedgerColumn[];
  rows: R[];
  footer?: Record<string, Cell>;
  dense?: boolean;
  caption?: string;
  onRowClick?: (row: R) => void;
  // Search box on top; on unless turned off
  search?: boolean;
  filters?: LedgerFilter[];
  loading?: boolean;
  // On phones, draw the matching rows this way instead of the table
  phone?: (rows: R[]) => ReactNode;
};

export function LedgerTable<R extends LedgerRow>({ columns, rows, footer, dense, caption, onRowClick, search = true, filters, loading, phone }: LedgerTableProps<R>) {
  const query = useLedgerQuery(rows, columns, filters);
  const scroll = useTableScrollState();
  const label = caption ?? "Table";
  const toolbar = (search || query.filters.length > 0) && (rows.length > 0 || query.active);
  const noMatches = query.active && query.rows.length === 0 && rows.length > 0;
  return (
    <div className="w-full">
      {toolbar ? <TableToolbar query={query} label={label} /> : null}
      <div className={cn("relative", phone && "hidden lg:block")}>
        <Table
          className="w-full border-collapse text-body text-ink tabular-nums"
          containerProps={{ ref: scroll.ref, onScroll: scroll.onScroll, tabIndex: 0, role: "region", "aria-label": label, className: "outline-none focus-visible:shadow-focus" }}
        >
          {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow className="border-b border-line hover:bg-transparent">
              {columns.map((c, i) => (
                <TableHead key={c.key} scope="col" style={c.width ? { width: c.width } : undefined} className={cn(HEAD_CELL, EDGE, ALIGN[c.align ?? "left"], i === 0 && cn(PINNED, "z-2"))}>
                  {c.label}
                  {i === 0 && scroll.fromLeft ? <FrozenColumnFade /> : null}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody aria-busy={loading || undefined}>
            {loading && rows.length === 0 ? <LedgerSkeletonRows columns={columns} /> : null}
            {noMatches ? <NoMatchesRow span={columns.length} search={query.search} onClear={query.clear} /> : null}
            {query.rows.map((row, i) => (
              <LedgerBodyRow key={row.id ?? i} row={row} columns={columns} dense={dense} faded={scroll.fromLeft} onOpen={onRowClick} />
            ))}
          </TableBody>
          {/* Totals are for every row, so they hide while the rows are narrowed */}
          {footer && !query.active ? (
            <TableFooter className="border-t-[1.5px] border-ink bg-transparent font-extrabold">
              <TableRow className="hover:bg-transparent">
                {columns.map((c, i) => (
                  <TableCell key={c.key} className={cn("bg-surface px-4 py-3.5", EDGE, ALIGN[c.align ?? "left"], i === 0 && cn(PINNED, "z-1"))}>
                    <LedgerCell cell={footer[c.key]} />
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
        {scroll.fromRight ? <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-ink/6 to-transparent" /> : null}
      </div>
      {phone ? <div className="lg:hidden">{noMatches ? <NoMatches search={query.search} onClear={query.clear} /> : phone(query.rows)}</div> : null}
    </div>
  );
}
