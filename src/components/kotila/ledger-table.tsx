"use client";
// Ledger of records: text left, figures right, hairline rows, heavy rule above totals
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LedgerCell, type Cell } from "@/components/kotila/ledger-cell";
import { cn } from "@/utils/cn";

type Column = { key: string; label: string; align?: "left" | "right" | "center"; width?: number | string };
type Row = Record<string, Cell> & { id?: string };

type LedgerTableProps<R extends Row> = {
  columns: Column[];
  rows: R[];
  footer?: Record<string, Cell>;
  dense?: boolean;
  caption?: string;
  onRowClick?: (row: R) => void;
};

const ALIGN = { left: "text-left", right: "text-right", center: "text-center" };
const EDGE = "first:pl-6 last:pr-6";

export function LedgerTable<R extends Row>({ columns, rows, footer, dense, caption, onRowClick }: LedgerTableProps<R>) {
  return (
    <div className="w-full">
      <Table
        className="w-full border-collapse text-body text-ink tabular-nums"
        containerProps={{ tabIndex: 0, role: "region", "aria-label": caption ?? "Table", className: "outline-none focus-visible:shadow-focus" }}
      >
        {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow className="border-b border-line hover:bg-transparent">
            {columns.map((c) => (
              <TableHead
                key={c.key}
                scope="col"
                style={c.width ? { width: c.width } : undefined}
                className={cn("h-auto bg-surface px-4 py-2.5 text-caption font-semibold whitespace-nowrap text-ink-muted", EDGE, ALIGN[c.align ?? "left"])}
              >
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={row.id ?? i}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(row) : undefined}
              className={cn("border-b border-line-soft last:border-b-0 hover:bg-transparent", onRowClick && "cursor-pointer outline-none hover:bg-row-hover focus-visible:bg-row-hover")}
            >
              {columns.map((c) => (
                <TableCell key={c.key} className={cn("px-4 align-middle whitespace-normal", dense ? "py-2.5" : "py-3.5", EDGE, ALIGN[c.align ?? "left"])}>
                  <LedgerCell cell={row[c.key]} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {footer ? (
          <TableFooter className="border-t-[1.5px] border-ink bg-transparent font-extrabold">
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableCell key={c.key} className={cn("px-4 py-3.5", EDGE, ALIGN[c.align ?? "left"])}>
                  <LedgerCell cell={footer[c.key]} />
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </div>
  );
}
