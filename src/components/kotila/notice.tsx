// Full-width message: icon, a title that states the fact, one line, at most one action
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, type ButtonVariant } from "@/components/kotila/button";
import { Icon } from "@/svgs/icon";
import type { IconName } from "@/svgs/icon-paths";
import { isActionObject, type ActionObject, type ActionProp } from "@/types/action";
import { cn } from "@/utils/cn";

type NoticeTone = "neutral" | "warning" | "alert" | "success" | "owed";

const TONES: Record<NoticeTone, { box: string; icon: string; title: string; text: string; glyph: IconName }> = {
  neutral: { box: "border-line bg-surface", icon: "bg-surface-sunken text-ink-2", title: "text-ink", text: "text-ink-2", glyph: "info" },
  warning: { box: "border-warning-line bg-warning-bg", icon: "bg-warning-icon text-warning-ink", title: "text-warning-title", text: "text-warning-ink", glyph: "alert" },
  alert: { box: "border-alert-line bg-alert-surface", icon: "bg-alert-bg text-alert", title: "text-ink", text: "text-ink-2", glyph: "alert" },
  success: { box: "border-success-line bg-green-50", icon: "bg-green-100 text-green-800", title: "text-ink", text: "text-ink-2", glyph: "check" },
  owed: { box: "border-yellow-300 bg-yellow-100", icon: "bg-yellow-500 text-yellow-ink", title: "text-yellow-ink", text: "text-yellow-ink", glyph: "naira" },
};

type NoticeProps = {
  tone?: NoticeTone;
  icon?: IconName;
  title?: ReactNode;
  compact?: boolean;
  action?: ActionProp<ActionObject & { variant?: ButtonVariant }>;
  children?: ReactNode;
};

export function Notice({ tone = "neutral", icon, title, compact, action, children }: NoticeProps) {
  const t = TONES[tone];
  const actionNode = isActionObject(action) ? (
    <Button variant={action.variant ?? (tone === "owed" ? "owed" : "secondary")} href={action.href} onClick={action.onClick}>
      {action.label}
    </Button>
  ) : (
    action
  );
  return (
    <Alert
      role={tone === "alert" ? "alert" : "status"}
      className={cn("flex flex-wrap items-start gap-3.5 rounded-lg border px-4.5 py-4 sm:flex-nowrap", compact && "rounded-md px-3.5 py-3", t.box)}
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", compact && "size-7", t.icon)}>
        <Icon name={icon ?? t.glyph} size={compact ? 16 : 20} strokeWidth={2.2} />
      </span>
      <div className="flex min-w-0 grow flex-col gap-1">
        {title ? <strong className={cn("text-base leading-5.5 font-bold", t.title)}>{title}</strong> : null}
        {children ? <div className={cn("text-body", t.text)}>{children}</div> : null}
      </div>
      {/* On phones the action drops under the text so the words keep their width */}
      {actionNode ? <div className="shrink-0 self-center max-sm:basis-full max-sm:pl-13.5 max-sm:*:w-full">{actionNode}</div> : null}
    </Alert>
  );
}
