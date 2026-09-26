// Label row for a group of choices (chips, segments), with "optional" and an aside
import type { ReactNode } from "react";

export function ChoiceLabel({ id, label, optional, aside }: { id: string; label: ReactNode; optional?: boolean; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span id={id} className="text-[15px] leading-5 font-semibold text-ink">
        {label}
        {optional ? <span className="ml-1.5 text-caption font-medium text-ink-muted">optional</span> : null}
      </span>
      {aside}
    </div>
  );
}
