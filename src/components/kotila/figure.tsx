// A labelled figure; ink unless the number needs action
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type FigureProps = {
  label?: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  delta?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "alert" | "owed" | "ondeep" | "standard";
};

const VALUE_SIZE = {
  sm: "text-[17px] leading-6 font-bold",
  md: "text-figure font-extrabold tracking-[-0.01em]",
  lg: "text-[34px] leading-10 font-extrabold tracking-[-0.02em]",
  xl: "text-figure-xl font-extrabold tracking-[-0.02em]",
};

const VALUE_TONE = { alert: "text-alert", owed: "text-owed", ondeep: "text-on-deep", standard: "text-yellow-500" };

export function Figure({ label, value, sub, delta, size = "md", tone }: FigureProps) {
  const muted = tone === "ondeep" ? "text-on-deep-muted" : "text-ink-muted";
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {label ? <span className={cn("text-caption font-medium", muted)}>{label}</span> : null}
      <strong className={cn("text-ink tabular-nums", VALUE_SIZE[size], tone && VALUE_TONE[tone])}>{value}</strong>
      {sub || delta ? (
        <span className={cn("flex flex-wrap items-center gap-1.5 text-caption font-medium", muted)}>
          {delta}
          {sub}
        </span>
      ) : null}
    </div>
  );
}
