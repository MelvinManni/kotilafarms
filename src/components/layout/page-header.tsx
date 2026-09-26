// Page title with an optional line above it and actions on the right
import type { ReactNode } from "react";

type PageHeaderProps = { title: ReactNode; eyebrow?: ReactNode; actions?: ReactNode };

export function PageHeader({ title, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        {eyebrow ? (
          <span className="text-[15px] leading-5 font-medium text-ink-muted in-data-[shell=phone]:text-[#d6e8c8] in-data-[shell=responsive]:max-lg:text-[#d6e8c8]">{eyebrow}</span>
        ) : null}
        {/* White over the green band on phones */}
        <h1 className="m-0 font-display text-[34px] leading-tight font-semibold tracking-[-0.02em] in-data-[shell=phone]:text-white in-data-[shell=responsive]:max-lg:text-white lg:text-display">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
