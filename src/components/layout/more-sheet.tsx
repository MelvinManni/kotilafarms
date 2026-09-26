"use client";
// Phone "More": every section this role can open, as big rows
import Link from "next/link";
import { Sheet } from "@/components/kotila/sheet";
import { RAIL_NAV } from "@/constants/nav";
import { Icon } from "@/svgs/icon";
import type { Role } from "@/types/role";

export function MoreSheet({ role, onClose }: { role: Role; onClose: () => void }) {
  const items = [...RAIL_NAV.filter((n) => !n.roles || n.roles.includes(role)), { id: "settings", label: "Settings", icon: "settings" as const, href: "/settings" }];
  return (
    <Sheet variant="sheet" title="More" onClose={onClose}>
      <nav aria-label="All sections" className="-mx-2 flex flex-col">
        {items.map((it) => (
          <Link key={it.id} href={it.href} onClick={onClose} className="flex min-h-14 items-center gap-4 rounded-md px-3 text-body-lg font-semibold text-ink no-underline outline-none hover:bg-surface-sunken focus-visible:shadow-focus">
            <Icon name={it.icon} size={22} />
            {it.label}
            <Icon name="chevron-right" size={18} className="ml-auto text-ink-faint" />
          </Link>
        ))}
      </nav>
    </Sheet>
  );
}
