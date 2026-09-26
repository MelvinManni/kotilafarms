// Change against a comparison; goodWhen maps direction to good or bad
import type { ReactNode } from "react";
import { Tooltip } from "@/components/kotila/tooltip";
import { cn } from "@/utils/cn";

type DeltaProps = {
  direction?: "up" | "down" | "flat";
  goodWhen?: "up" | "down";
  tone?: "good" | "bad";
  tooltip?: string;
  children: ReactNode;
};

const ARROWS = { up: "▲", down: "▼", flat: "–" } as const;

export function Delta({ direction = "up", goodWhen, tone, tooltip, children }: DeltaProps) {
  const resolved = tone ?? (goodWhen ? (goodWhen === direction ? "good" : "bad") : "bad");
  const chip = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.25 py-0.75 text-caption leading-4.5 font-bold whitespace-nowrap",
        direction === "flat" && "bg-surface-sunken text-ink-muted",
        direction !== "flat" && resolved === "good" && "bg-green-50 text-green-800",
        direction !== "flat" && resolved === "bad" && "bg-alert-bg text-alert-ink",
      )}
    >
      {ARROWS[direction]} {children}
    </span>
  );
  if (!tooltip) return chip;
  return (
    <Tooltip label={tooltip}>
      <span tabIndex={0} className="inline-flex rounded-full outline-none focus-visible:shadow-focus">
        {chip}
      </span>
    </Tooltip>
  );
}
