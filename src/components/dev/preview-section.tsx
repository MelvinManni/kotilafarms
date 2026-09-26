// Titled block on the dev components page
import type { ReactNode } from "react";

export function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-8">
      <h2 className="m-0 font-display text-title-lg font-semibold text-ink">{title}</h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
