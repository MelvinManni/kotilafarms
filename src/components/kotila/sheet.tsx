"use client";
// Glass modal on desktop, bottom sheet on phone; closes on Escape or the backdrop
import { useRef, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/kotila/icon-button";
import { cn } from "@/utils/cn";

type SheetProps = {
  title: ReactNode;
  description?: ReactNode;
  open?: boolean;
  variant?: "modal" | "sheet";
  wide?: boolean;
  onClose?: () => void;
  footer?: ReactNode;
  children?: ReactNode;
};

export function Sheet({ title, description, open = true, variant = "modal", wide, onClose, footer, children }: SheetProps) {
  const sheet = variant === "sheet";
  // Focus the sheet itself on open, so the close button's tooltip doesn't pop up
  const popupRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogPortal>
        <DialogOverlay className="bg-scrim supports-backdrop-filter:backdrop-blur-none" />
        <DialogPrimitive.Popup
          ref={popupRef}
          initialFocus={popupRef}
          tabIndex={-1}
          className={cn(
            "fixed z-50 flex max-h-[calc(100dvh-3rem)] w-full flex-col overflow-auto border border-glass-line bg-white/90 text-ink shadow-modal outline-none backdrop-blur-[24px] backdrop-saturate-[1.8] duration-150",
            sheet
              ? "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl data-closed:animate-out data-closed:slide-out-to-bottom data-open:animate-in data-open:slide-in-from-bottom"
              : "top-1/2 left-1/2 max-w-[min(560px,calc(100%-3rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            !sheet && wide && "max-w-[min(720px,calc(100%-3rem))]",
          )}
        >
          {sheet ? <span className="mt-2.5 h-1.25 w-10 self-center rounded-full bg-line-strong" aria-hidden /> : null}
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
            <div>
              <DialogTitle className="m-0 font-display text-title-lg font-semibold">{title}</DialogTitle>
              {description ? <DialogDescription className="mt-1.5 text-body text-ink-muted">{description}</DialogDescription> : null}
            </div>
            <IconButton icon="x" label="Close" variant="ghost" onClick={onClose} tooltipPlacement="below" />
          </div>
          <div className="flex flex-col gap-5 px-6 py-4">{children}</div>
          {footer ? (
            <div className={cn("flex justify-end gap-3 border-t border-line-soft px-6 pt-4 pb-6", sheet && "flex-col-reverse pb-[max(1.5rem,env(safe-area-inset-bottom))] *:w-full")}>
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
