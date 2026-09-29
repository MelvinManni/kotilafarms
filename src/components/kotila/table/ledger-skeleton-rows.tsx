// Grey placeholder rows while a table's records load
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ALIGN, EDGE } from "@/components/kotila/table/ledger-classes";
import type { LedgerColumn } from "@/types/ledger";
import { cn } from "@/utils/cn";

const ROWS = 5;

export function LedgerSkeletonRows({ columns }: { columns: LedgerColumn[] }) {
  return Array.from({ length: ROWS }, (_, row) => (
    <TableRow key={row} aria-hidden className="border-b border-line-soft last:border-b-0 hover:bg-transparent">
      {columns.map((c, i) => (
        <TableCell key={c.key} className={cn("px-4 py-4", EDGE, ALIGN[c.align ?? "left"])}>
          <Skeleton className={cn("inline-block h-4 rounded-sm bg-surface-sunken", i === 0 ? "w-32" : "w-16")} />
        </TableCell>
      ))}
    </TableRow>
  ));
}
