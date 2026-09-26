// A titled block of a report that never splits across printed pages
import type { ReactNode } from "react";

export function ReportSection({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 break-inside-avoid flex-col gap-2">
      <h2 className="m-0 font-display text-[19px] leading-6 font-semibold text-ink">{title}</h2>
      {note ? <p className="m-0 text-caption text-ink-muted">{note}</p> : null}
      {children}
    </section>
  );
}
