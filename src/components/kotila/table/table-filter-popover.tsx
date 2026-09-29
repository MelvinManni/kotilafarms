"use client";
// Filter button above a table; each filter lists the choices found in the rows, with how many
import { Checkbox } from "@/components/kotila/fields/checkbox";
import { Button, kotilaButtonVariants } from "@/components/kotila/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FilterState } from "@/hooks/use-ledger-query";
import { Icon } from "@/svgs/icon";
import { cn } from "@/utils/cn";

type TableFilterPopoverProps = {
  filters: FilterState[];
  pickedCount: number;
  onToggle: (key: string, value: string) => void;
  onClear: () => void;
};

export function TableFilterPopover({ filters, pickedCount, onToggle, onClear }: TableFilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={pickedCount ? `Filter, ${pickedCount} picked` : "Filter"}
        className={cn(kotilaButtonVariants({ variant: "secondary" }), "shrink-0 px-4", pickedCount > 0 && "border-green-600 text-green-700")}
      >
        <Icon name="filter" size={18} strokeWidth={2.4} />
        <span>Filter</span>
        {pickedCount ? <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs leading-4 font-bold text-on-deep">{pickedCount}</span> : null}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="max-h-[min(70vh,480px)] w-72 gap-4 overflow-y-auto rounded-xl bg-surface p-4 text-ink shadow-modal ring-1 ring-line">
        {filters.map((f) => (
          <fieldset key={f.key} className="m-0 flex flex-col border-0 p-0">
            <legend className="mb-1 p-0 text-caption font-bold text-ink-muted">{f.label}</legend>
            {f.choices.map((c) => (
              <Checkbox
                key={c.value}
                checked={f.picked.includes(c.value)}
                onChange={() => onToggle(f.key, c.value)}
                label={
                  <>
                    {c.value} <span className="text-ink-muted tabular-nums">({c.count})</span>
                  </>
                }
              />
            ))}
          </fieldset>
        ))}
        {pickedCount ? (
          <Button variant="quiet" onClick={onClear} className="self-start px-0 hover:bg-transparent">
            Clear filters
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
