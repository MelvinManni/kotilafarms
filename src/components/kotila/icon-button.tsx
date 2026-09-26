"use client";
// Round icon-only button; `label` is both the aria-label and the tooltip
// Base UI directly, not shadcn's Button, so hover keeps the icon colour
import { Button as ButtonBase } from "@base-ui/react/button";
import { Tooltip } from "@/components/kotila/tooltip";
import { Icon } from "@/svgs/icon";
import type { IconName } from "@/svgs/icon-paths";
import { cn } from "@/utils/cn";

type IconButtonProps = {
  icon: IconName;
  label: string;
  tooltip?: string;
  variant?: "default" | "ghost";
  size?: "md" | "lg";
  tooltipPlacement?: "above" | "below";
  tooltipOpen?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function IconButton({ icon, label, tooltip, variant = "default", size = "md", tooltipPlacement, tooltipOpen, disabled, onClick }: IconButtonProps) {
  return (
    <Tooltip label={tooltip ?? label} placement={tooltipPlacement} open={tooltipOpen}>
      <ButtonBase
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface p-0 text-ink-2 outline-none transition-[background-color,box-shadow] hover:bg-surface-sunken focus-visible:border-green-600 focus-visible:shadow-focus disabled:cursor-not-allowed disabled:text-ink-faint",
          variant === "ghost" && "border-transparent bg-transparent",
          size === "lg" && "size-14",
        )}
      >
        <Icon name={icon} size={size === "lg" ? 24 : 20} />
      </ButtonBase>
    </Tooltip>
  );
}
