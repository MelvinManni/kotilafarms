// White sheet on the green ground; `headline` titles state a finding, `deep` is for the growth chart
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { PanelAction } from "@/components/kotila/panel-action";
import { isActionObject, type ActionProp } from "@/types/action";
import { cn } from "@/utils/cn";

type PanelProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  headline?: boolean;
  action?: ActionProp;
  variant?: "sunken" | "raised" | "deep";
  flush?: boolean;
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
};

export function Panel({ title, subtitle, headline, action, variant, flush, ariaLabel, className, children }: PanelProps) {
  const deep = variant === "deep";
  const label = ariaLabel ?? (typeof title === "string" ? title : undefined);
  const actionNode = isActionObject(action) ? <PanelAction action={action} onDeep={deep} /> : action;
  return (
    <Card
      role={label ? "region" : undefined}
      aria-label={label}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl border border-line bg-surface px-6 py-5.5 text-ink shadow-none ring-0",
        variant === "sunken" && "bg-surface-sunken",
        variant === "raised" && "rounded-lg border-transparent p-4.5 shadow-raise",
        deep && "rounded-2xl border-green-900 bg-green-900 px-8 pt-7 pb-5 text-on-deep",
        flush && "gap-0 overflow-hidden p-0",
        className,
      )}
    >
      {title || actionNode ? (
        <div className={cn("flex items-baseline justify-between gap-4", flush && "px-6 pt-5 pb-3")}>
          <div className="flex min-w-0 flex-col gap-1">
            {title ? (
              <h2 className={cn("m-0 font-display font-semibold", headline ? "text-title-lg tracking-[-0.01em]" : "text-title")}>{title}</h2>
            ) : null}
            {subtitle ? <p className={cn("m-0 text-body", deep ? "text-on-deep-muted" : "text-ink-muted")}>{subtitle}</p> : null}
          </div>
          {actionNode}
        </div>
      ) : null}
      {children}
    </Card>
  );
}
