// One line under a field: the error if there is one, otherwise the hint
import type { ReactNode } from "react";
import { Icon } from "@/svgs/icon";

export function FieldMessage({ error, hint, id }: { error?: ReactNode; hint?: ReactNode; id?: string }) {
  if (error) {
    return (
      <div id={id} role="alert" className="flex items-center gap-1.5 text-sm leading-5 font-semibold text-alert">
        <Icon name="alert" size={16} />
        {error}
      </div>
    );
  }
  if (hint) return <div id={id} className="text-caption font-medium text-ink-muted">{hint}</div>;
  return null;
}
