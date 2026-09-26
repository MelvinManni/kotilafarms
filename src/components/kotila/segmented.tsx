"use client";
// Segmented control for a short either/or choice (bags or kg, water level)
import { useId } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChoiceLabel } from "@/components/kotila/choice-label";
import { useControlled } from "@/hooks/use-controlled";
import { toOption, type Option } from "@/types/option";

type SegmentedProps = {
  label?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  optional?: boolean;
};

export function Segmented({ label, options, value, defaultValue, onChange, optional }: SegmentedProps) {
  const labelId = useId();
  const [current, setCurrent] = useControlled<string | undefined>(value, defaultValue, (v) => v !== undefined && onChange?.(v));
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label ? <ChoiceLabel id={labelId} label={label} optional={optional} /> : null}
      <ToggleGroup
        value={current ? [current] : []}
        onValueChange={(next) => next[0] !== undefined && setCurrent(next[0])}
        aria-labelledby={label ? labelId : undefined}
        spacing={1}
        className="grid w-full auto-cols-fr grid-flow-col gap-1 rounded-md border border-line bg-surface-sunken p-1"
      >
        {options.map(toOption).map((opt) => (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className="h-auto min-h-12 rounded-sm border-0 bg-transparent px-3 text-[15px] leading-tight font-semibold text-ink-2 hover:bg-surface/60 hover:text-ink-2 focus-visible:shadow-focus focus-visible:ring-0 data-pressed:bg-surface data-pressed:text-ink data-pressed:shadow-seg data-pressed:hover:text-ink data-pressed:focus-visible:shadow-focus"
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
