"use client";
// Toggle chips: quick observation tags (multiple) or one optional cause (single)
import { useId, type ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChoiceLabel } from "@/components/kotila/choice-label";
import { useControlled } from "@/hooks/use-controlled";
import { Icon } from "@/svgs/icon";
import { toOption, type Option } from "@/types/option";
import { cn } from "@/utils/cn";

type ChipValue = string[] | string | null;

type ChipGroupProps = {
  label?: string;
  options: Option[];
  value?: ChipValue;
  defaultValue?: ChipValue;
  multiple?: boolean;
  onChange?: (value: ChipValue) => void;
  size?: "sm" | "md";
  optional?: boolean;
  hint?: string;
  aside?: ReactNode;
};

// Group value as an array, whatever the mode
function asArray(value: ChipValue): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export function ChipGroup({ label, options, value, defaultValue, multiple = true, onChange, size = "md", optional, hint, aside }: ChipGroupProps) {
  const labelId = useId();
  const [current, setCurrent] = useControlled<ChipValue>(value, defaultValue ?? (multiple ? [] : null), onChange);
  const pressed = asArray(current);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label ? <ChoiceLabel id={labelId} label={label} optional={optional} aside={aside} /> : null}
      <ToggleGroup
        multiple={multiple}
        value={pressed}
        onValueChange={(next) => setCurrent(multiple ? next : (next[0] ?? null))}
        aria-labelledby={label ? labelId : undefined}
        className="flex w-full flex-wrap gap-2"
      >
        {options.map(toOption).map((opt) => (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className={cn(
              "h-auto min-h-11 gap-1.5 rounded-full border-[1.5px] border-line-strong bg-surface px-4 text-[15px] leading-none font-semibold text-ink-2 hover:bg-surface-sunken focus-visible:shadow-focus focus-visible:ring-0 data-pressed:border-green-600 data-pressed:bg-green-100 data-pressed:text-green-800",
              size === "sm" && "min-h-9 px-3 text-sm",
            )}
          >
            {pressed.includes(opt.value) ? <Icon name="check" size={16} strokeWidth={2.8} /> : null}
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {hint ? <div className="text-caption font-medium text-ink-muted">{hint}</div> : null}
    </div>
  );
}
