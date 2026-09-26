"use client";
// Dark tooltip bubble on hover or focus; `open` forces it visible
import type { ReactElement, ReactNode } from "react";
import { Tooltip as TooltipRoot, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TooltipProps = {
  label: ReactNode;
  placement?: "above" | "below";
  open?: boolean;
  children: ReactElement;
};

export function Tooltip({ label, placement = "above", open, children }: TooltipProps) {
  return (
    <TooltipRoot open={open}>
      <TooltipTrigger render={children} />
      <TooltipContent
        side={placement === "below" ? "bottom" : "top"}
        sideOffset={8}
        className="max-w-[260px] rounded-sm bg-ink px-3 py-2 text-caption font-medium text-white"
      >
        {label}
      </TooltipContent>
    </TooltipRoot>
  );
}
