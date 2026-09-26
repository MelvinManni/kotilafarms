// Desktop side rail: brand, role-filtered nav with badges, sync status, settings and the signed-in person
import Link from "next/link";
import { Person } from "@/components/kotila/person";
import { SyncStatus } from "@/components/kotila/sync-status";
import { Wordmark } from "@/components/kotila/wordmark";
import { KotilaIcon } from "@/svgs/kotila-icon";
import { Icon } from "@/svgs/icon";
import type { NavItem } from "@/types/nav";
import type { Role } from "@/types/role";
import type { SyncSummary } from "@/types/sync-state";
import { cn } from "@/utils/cn";

type Badge = number | { count: number; title: string };

type SideRailProps = {
  items: NavItem[];
  active?: string;
  badges?: Record<string, Badge>;
  user?: { name: string; role: Role };
  sync?: SyncSummary;
  settingsHref?: string;
};

const itemClasses =
  "flex h-11 w-full items-center gap-3 rounded-[12px] px-3 text-[15px] leading-none font-semibold text-ink-2 no-underline outline-none hover:bg-sidebar-accent focus-visible:shadow-focus aria-[current=page]:bg-green-600 aria-[current=page]:text-white";

export function SideRail({ items, active, badges = {}, user, sync, settingsHref = "/settings" }: SideRailProps) {
  const visible = items.filter((it) => !it.roles || !user || it.roles.includes(user.role));
  return (
    <nav aria-label="Main" className="flex h-full min-h-full w-62 flex-col gap-7 border-r border-sidebar-border bg-glass px-4 py-7 backdrop-blur-[20px] backdrop-saturate-[1.8]">
      <div className="flex items-center gap-2.5 px-2">
        <KotilaIcon className="w-9" />
        <Wordmark />
      </div>
      <div className="flex flex-col gap-0.5">
        {visible.map((it) => {
          const badge = badges[it.id];
          return (
            <Link key={it.id} href={it.href} aria-current={active === it.id ? "page" : undefined} className={itemClasses}>
              <Icon name={it.icon} />
              {it.label}
              {badge ? (
                <span
                  title={typeof badge === "object" ? badge.title : undefined}
                  className="ml-auto h-6 min-w-6 rounded-full bg-yellow-500 px-1.75 text-center text-caption leading-6 font-extrabold text-yellow-ink"
                >
                  {typeof badge === "object" ? badge.count : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col gap-3">
        {sync ? <SyncStatus variant="block" {...sync} /> : null}
        <Link href={settingsHref} aria-current={active === "settings" ? "page" : undefined} className={cn(itemClasses)}>
          <Icon name="settings" />
          Settings
        </Link>
        {user ? (
          <div className="flex border-t border-sidebar-border px-2 pt-4">
            <Person name={user.name} role={user.role} />
          </div>
        ) : null}
      </div>
    </nav>
  );
}
