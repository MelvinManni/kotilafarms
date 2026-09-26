// Label–value pairs down a panel; a total row gets a heavy ink rule
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Row = { label: ReactNode; value: ReactNode; sub?: ReactNode; total?: boolean; tone?: "alert" | "owed" };

export function Rows({ items }: { items: Row[] }) {
  return (
    <div className="flex flex-col">
      {items.map((row, i) => (
        <div
          key={i}
          className={cn(
            "flex items-baseline justify-between gap-4 border-t border-line-soft py-2.5 text-body text-ink-2 first:border-t-0",
            row.total && "mt-0.5 border-t-[1.5px] border-ink pt-3 first:border-t-[1.5px]",
          )}
        >
          <span className={cn(row.total && "font-bold text-ink")}>
            {row.label}
            {row.sub ? <span className="block text-caption font-medium text-ink-muted">{row.sub}</span> : null}
          </span>
          <span
            className={cn(
              "text-right text-body font-bold text-ink tabular-nums",
              row.total && "text-[17px] font-extrabold",
              row.tone === "alert" && "text-alert",
              row.tone === "owed" && "text-owed",
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
