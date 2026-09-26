"use client";
// Connection and sync state: always words plus colour, with a tooltip saying what to do
import { Tooltip } from "@/components/kotila/tooltip";
import { Icon } from "@/svgs/icon";
import type { SyncState } from "@/types/sync-state";
import { SYNC_TIPS, syncText } from "@/utils/format/sync-text";
import { cn } from "@/utils/cn";

type SyncStatusProps = {
  state: SyncState;
  pending?: number;
  lastSynced?: string;
  variant?: "pill" | "block";
  tooltip?: string;
  tooltipOpen?: boolean;
  tooltipPlacement?: "above" | "below";
  onClick?: () => void;
};

const TONES: Record<SyncState, { box: string; dot: string }> = {
  synced: { box: "bg-green-50 text-green-800", dot: "bg-green-600" },
  syncing: { box: "border-line bg-surface-sunken text-ink-2", dot: "" },
  offline: { box: "border-warning-line bg-warning-bg text-warning-title", dot: "bg-warning-dot" },
  conflict: { box: "border-alert-line bg-alert-bg text-alert-ink", dot: "bg-alert" },
  rejected: { box: "border-alert-line bg-alert-bg text-alert-ink", dot: "bg-alert" },
};

export function SyncStatus({ state, pending = 0, lastSynced, variant = "pill", tooltip, tooltipOpen, tooltipPlacement, onClick }: SyncStatusProps) {
  const text = syncText(state, pending, lastSynced);
  const tip = tooltip ?? SYNC_TIPS[state];
  const block = variant === "block";
  let marker = <span className={cn("size-2 rounded-full", TONES[state].dot)} aria-hidden />;
  if (state === "syncing") marker = <Icon name="sync" size={16} className="animate-spin-slow motion-reduce:animate-none" />;
  else if (state === "synced" && block) marker = <Icon name="check" size={16} strokeWidth={2.6} />;
  return (
    <Tooltip label={tip} placement={tooltipPlacement} open={tooltipOpen}>
      <button
        type="button"
        aria-label={`${text}. ${tip}`}
        onClick={onClick}
        className={cn(
          "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-transparent pr-3.5 pl-3 text-sm leading-none font-bold whitespace-nowrap outline-none focus-visible:shadow-focus",
          TONES[state].box,
          block && "min-h-12 w-full rounded-md px-3 font-medium",
        )}
      >
        {marker}
        <span>{text}</span>
      </button>
    </Tooltip>
  );
}
