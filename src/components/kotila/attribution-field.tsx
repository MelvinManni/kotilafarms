"use client";
// Required Set-or-overhead choice for every expense; value is a Set id or "overhead"
import { useId } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@/components/ui/radio-group";
import { Tooltip } from "@/components/kotila/tooltip";
import { useControlled } from "@/hooks/use-controlled";
import { Icon } from "@/svgs/icon";
import { cn } from "@/utils/cn";

type AttributionFieldProps = {
  sets: { id: string; label: string; meta?: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  showError?: boolean;
  label?: string;
  overheadHint?: string;
  // Off for things that always belong to one Set (ingredients)
  allowOverhead?: boolean;
};

const tileClasses =
  "flex min-h-14 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-md border-[1.5px] border-line-strong bg-surface px-4 py-2 text-left text-ink outline-none focus-visible:shadow-focus";

export function AttributionField({ sets, value, defaultValue, onChange, showError, label, overheadHint, allowOverhead = true }: AttributionFieldProps) {
  const labelId = useId();
  const [current, setCurrent] = useControlled<string | undefined>(value, defaultValue, (v) => v && onChange?.(v));
  const missing = showError && !current;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span id={labelId} className="text-[15px] leading-5 font-semibold text-ink">
          {label ?? "Which Set is this for?"}
          <span className="ml-0.5 text-alert" aria-hidden>{" *"}</span>
        </span>
        <Tooltip label="Every expense belongs to one Set, or to the farm as a whole. This is what makes profit per Set real.">
          <button type="button" aria-label="Why this is required" className="inline-flex text-ink-muted">
            <Icon name="info" size={18} />
          </button>
        </Tooltip>
      </div>
      <RadioGroup
        value={current ?? null}
        onValueChange={(next) => setCurrent(String(next))}
        aria-labelledby={labelId}
        aria-required
        className="flex flex-wrap gap-2"
      >
        {sets.map((set) => (
          <Radio.Root
            key={set.id}
            value={set.id}
            render={<button type="button" />}
            nativeButton
            className={cn(tileClasses, "data-checked:border-green-600 data-checked:bg-green-50 data-checked:inset-ring-[1.5px] data-checked:inset-ring-green-600", missing && "border-alert")}
          >
            <strong className="text-[15px] leading-5 font-bold">{set.label}</strong>
            {set.meta ? <span className="text-caption font-medium text-ink-muted">{set.meta}</span> : null}
          </Radio.Root>
        ))}
        {allowOverhead ? (
          <Radio.Root
            value="overhead"
            render={<button type="button" />}
            nativeButton
            className={cn(tileClasses, "data-checked:border-ink-2 data-checked:bg-surface-sunken data-checked:inset-ring-[1.5px] data-checked:inset-ring-ink-2", missing && "border-alert")}
          >
            <strong className="text-[15px] leading-5 font-bold">Farm overhead</strong>
            <span className="text-caption font-medium text-ink-muted">{overheadHint ?? "Shared by all Sets"}</span>
          </Radio.Root>
        ) : null}
      </RadioGroup>
      {missing ? (
        <div role="alert" className="flex items-center gap-1.5 text-sm leading-5 font-semibold text-alert">
          <Icon name="alert" size={16} />
          {allowOverhead ? "Choose a Set or farm overhead before saving." : "Choose the Set before saving."}
        </div>
      ) : null}
    </div>
  );
}
