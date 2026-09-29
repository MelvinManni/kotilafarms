// One LedgerTable cell: a plain value, or value + sub-line, tone, tag, status or delta
import type { ReactNode } from "react";
import { Delta } from "@/components/kotila/delta";
import { StatusChip } from "@/components/kotila/status-chip";
import { Tag } from "@/components/kotila/tag";
import type { Cell } from "@/types/ledger";
import { isCellObject } from "@/utils/table/cell-text";
import { cn } from "@/utils/cn";

export type { Cell, CellObject } from "@/types/ledger";

export function LedgerCell({ cell }: { cell: Cell }) {
  if (!isCellObject(cell)) return <>{cell}</>;
  let main: ReactNode;
  if (cell.status) main = <StatusChip status={cell.status} day={cell.day} />;
  else if (cell.tag) main = <Tag tone={cell.tag.tone}>{cell.tag.label}</Tag>;
  else
    main = (
      <span
        className={cn(
          "font-bold",
          cell.figure && "text-[22px] leading-7 font-extrabold",
          cell.tone === "alert" && "text-alert",
          cell.tone === "owed" && "text-owed",
          cell.tone === "muted" && "font-medium text-ink-muted",
        )}
      >
        {cell.value}
      </span>
    );
  return (
    <div className="flex flex-col gap-0.5 in-[.text-right]:items-end">
      {main}
      {cell.delta ? (
        <span>
          <Delta direction={cell.delta.direction} tone={cell.delta.tone}>{cell.delta.label}</Delta>
        </span>
      ) : null}
      {cell.sub ? <span className="text-caption font-medium text-ink-muted">{cell.sub}</span> : null}
    </div>
  );
}
