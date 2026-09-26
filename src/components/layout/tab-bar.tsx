// Phone tab bar (glass); a `primary` item shows as a round + button; items without href are buttons
import Link from "next/link";
import { Icon } from "@/svgs/icon";
import type { TabItem } from "@/types/nav";

const itemClasses =
  "flex h-14 cursor-pointer flex-col items-center justify-center gap-0.75 rounded-[18px] border-0 bg-transparent text-xs leading-none font-semibold text-ink-2 no-underline outline-none focus-visible:shadow-focus aria-[current=page]:bg-green-50 aria-[current=page]:font-bold aria-[current=page]:text-green-800";

export function TabBar({ items, active, onPress }: { items: TabItem[]; active?: string; onPress?: (id: string) => void }) {
  return (
    <nav aria-label="Main" className="grid h-18 auto-cols-fr grid-flow-col items-center rounded-[26px] border border-glass-line bg-white/80 px-2 shadow-tabbar backdrop-blur-[20px] backdrop-saturate-[1.8]">
      {items.map((it) => {
        const content = it.primary ? (
          <span className="flex size-12 items-center justify-center rounded-full bg-green-600 text-white shadow-primary">
            <Icon name={it.icon ?? "plus"} size={24} strokeWidth={2.6} />
          </span>
        ) : (
          <>
            {it.icon ? <Icon name={it.icon} size={22} /> : null}
            {it.label}
          </>
        );
        const label = it.primary ? it.label : undefined;
        if (!it.href)
          return (
            <button key={it.id} type="button" aria-label={label} onClick={() => onPress?.(it.id)} className={itemClasses}>
              {content}
            </button>
          );
        return (
          <Link key={it.id} href={it.href} aria-label={label} aria-current={active === it.id ? "page" : undefined} className={itemClasses}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
