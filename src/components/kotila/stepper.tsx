"use client";
// Big − / + counter for deaths and other counts; 72px targets
import { useId, type ReactNode } from "react";
import { useControlled } from "@/hooks/use-controlled";
import { Icon } from "@/svgs/icon";
import { count } from "@/utils/format/count";
import { cn } from "@/utils/cn";

type StepperProps = {
  label?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
  alertAbove?: number;
  size?: "md" | "lg";
  aside?: ReactNode;
};

const buttonClasses =
  "flex size-18 shrink-0 cursor-pointer items-center justify-center rounded-lg border-[1.5px] border-line-strong bg-surface text-ink outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-45";

export function Stepper({ label, value, defaultValue = 0, onChange, min = 0, max, step = 1, unit, hint, alertAbove, size = "lg", aside }: StepperProps) {
  const labelId = useId();
  const [current, setCurrent] = useControlled(value, defaultValue, onChange);
  const isAlert = alertAbove !== undefined && current > alertAbove;
  const md = size === "md";
  const lower = () => setCurrent(Math.max(min, current - step));
  const raise = () => setCurrent(max === undefined ? current + step : Math.min(max, current + step));
  return (
    <div className="flex flex-col gap-2.5">
      {label ? (
        <div className="flex items-baseline justify-between gap-3">
          <span id={labelId} className="text-[15px] leading-5 font-semibold text-ink">{label}</span>
          {aside}
        </div>
      ) : null}
      <div role="group" aria-labelledby={label ? labelId : undefined} className="flex items-stretch gap-2.5">
        <button type="button" aria-label={`Decrease ${label ?? ""}`.trim()} disabled={current <= min} onClick={lower} className={cn(buttonClasses, md && "size-14 rounded-md")}>
          <Icon name="minus" size={28} strokeWidth={2.6} />
        </button>
        <output
          aria-live="polite"
          className={cn(
            "flex h-18 min-w-0 grow items-center justify-center gap-2 rounded-lg border-[1.5px] border-line bg-surface-sunken text-[40px] leading-none font-extrabold text-ink tabular-nums",
            md && "h-14 rounded-md text-[26px]",
            isAlert && "border-alert-line bg-alert-surface text-alert",
          )}
        >
          {count(current)}
          {unit ? <span className="text-[15px] leading-none font-semibold text-ink-muted">{unit}</span> : null}
        </output>
        <button type="button" aria-label={`Increase ${label ?? ""}`.trim()} disabled={max !== undefined && current >= max} onClick={raise} className={cn(buttonClasses, "border-ink bg-ink text-white", md && "size-14 rounded-md")}>
          <Icon name="plus" size={28} strokeWidth={2.6} />
        </button>
      </div>
      {hint ? <div className="text-caption font-medium text-ink-muted">{hint}</div> : null}
    </div>
  );
}
