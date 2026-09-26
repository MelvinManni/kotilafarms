// Phone tab bar (glass); a `primary` item shows as a round + button
import Link from "next/link";
import { Icon } from "@/svgs/icon";
import type { TabItem } from "@/types/nav";

export function TabBar({ items, active }: { items: TabItem[]; active?: string }) {
  return (
    <nav aria-label="Main" className="grid h-18 auto-cols-fr grid-flow-col items-center rounded-[26px] border border-glass-line bg-white/80 px-2 shadow-tabbar backdrop-blur-[20px] backdrop-saturate-[1.8]">
      {items.map((it) =>
        it.primary ? (
          <Link key={it.id} href={it.href} aria-label={it.label} className="flex h-14 items-center justify-center rounded-[18px] text-white outline-none focus-visible:shadow-focus">
            <span className="flex size-12 items-center justify-center rounded-full bg-green-600 shadow-primary">
              <Icon name={it.icon ?? "plus"} size={24} strokeWidth={2.6} />
            </span>
          </Link>
        ) : (
          <Link
            key={it.id}
            href={it.href}
            aria-current={active === it.id ? "page" : undefined}
            className="flex h-14 flex-col items-center justify-center gap-0.75 rounded-[18px] text-xs leading-none font-semibold text-ink-2 no-underline outline-none focus-visible:shadow-focus aria-[current=page]:bg-green-50 aria-[current=page]:font-bold aria-[current=page]:text-green-800"
          >
            {it.icon ? <Icon name={it.icon} size={22} /> : null}
            {it.label}
          </Link>
        ),
      )}
    </nav>
  );
}
