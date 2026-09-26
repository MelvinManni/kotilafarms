// Small pill label; tone carries meaning, `dot` marks live states like "On this phone"
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

export type TagTone = "neutral" | "success" | "warning" | "alert" | "deep" | "closed";

const TONES: Record<TagTone, string> = {
  neutral: "bg-surface-sunken text-ink-2 inset-ring inset-ring-line",
  success: "bg-green-50 text-green-800",
  warning: "bg-warning-tag text-warning-ink",
  alert: "bg-alert-bg text-alert-ink",
  deep: "bg-green-700 text-on-deep",
  closed: "bg-surface-sunken text-ink-muted inset-ring inset-ring-line",
};

type TagProps = { tone?: TagTone; dot?: boolean; title?: string; children: ReactNode };

export function Tag({ tone = "neutral", dot, title, children }: TagProps) {
  return (
    <Badge title={title} className={cn("h-auto gap-1.5 rounded-full border-0 px-2.5 py-0.75 text-caption leading-4.5 font-bold", TONES[tone])}>
      {dot ? <span className="size-1.75 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </Badge>
  );
}
