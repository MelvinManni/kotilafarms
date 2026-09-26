"use client";
// Phone top bar (glass): back or logo, page title, sync status, account
import Link from "next/link";
import { SyncStatus } from "@/components/kotila/sync-status";
import { Tooltip } from "@/components/kotila/tooltip";
import { KotilaIcon } from "@/svgs/kotila-icon";
import { Icon } from "@/svgs/icon";
import { ROLE_LABEL, type Role } from "@/types/role";
import type { SyncSummary } from "@/types/sync-state";
import { initials } from "@/utils/format/initials";

type TopBarProps = {
  title?: string;
  back?: { label: string; href: string };
  sync?: SyncSummary;
  user?: { name: string; role: Role };
  onAccount?: () => void;
};

export function TopBar({ title, back, sync, user, onAccount }: TopBarProps) {
  return (
    <header className="glass flex h-15 items-center gap-2.5 rounded-lg pr-2 pl-3.5">
      {back ? (
        <Tooltip label={back.label} placement="below">
          <Link href={back.href} aria-label={back.label} className="inline-flex size-11 items-center justify-center rounded-full text-ink-2 outline-none focus-visible:shadow-focus">
            <Icon name="chevron-left" />
          </Link>
        </Tooltip>
      ) : (
        <KotilaIcon className="w-8" title="Kotila Farms" />
      )}
      <span className="min-w-0 grow truncate font-display text-lg leading-tight font-semibold text-ink">{title}</span>
      {sync ? <SyncStatus tooltipPlacement="below" {...sync} /> : null}
      {user ? (
        <Tooltip label={`${user.name} · ${ROLE_LABEL[user.role]}`} placement="below">
          <button
            type="button"
            onClick={onAccount}
            aria-label={`Account: ${user.name}`}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-green-100 font-display text-[15px] font-semibold text-green-700 outline-none focus-visible:shadow-focus"
          >
            {initials(user.name)}
          </button>
        </Tooltip>
      ) : null}
    </header>
  );
}
