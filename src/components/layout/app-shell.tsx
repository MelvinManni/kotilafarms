"use client";
// App frame: side rail on desktop; green band, top bar and tab bar on phones (recorders always get the phone frame)
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AccountSheet } from "@/components/layout/account-sheet";
import { MoreSheet } from "@/components/layout/more-sheet";
import { PhoneBand } from "@/components/layout/phone-band";
import { SideRail } from "@/components/layout/side-rail";
import { TabBar } from "@/components/layout/tab-bar";
import { TopBar } from "@/components/layout/top-bar";
import { MANAGER_TABS, RAIL_NAV, RECORDER_TABS, activeNavId } from "@/constants/nav";
import { useSyncSummary } from "@/hooks/use-sync-summary";
import { rememberUser } from "@/lib/offline/remembered-user";
import type { SessionUser } from "@/types/session";
import { cn } from "@/utils/cn";

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const sync = useSyncSummary();
  const [sheet, setSheet] = useState<"account" | "more" | null>(null);
  const phoneOnly = user.role === "recorder";
  const active = activeNavId(pathname);

  // Keep this person available for offline sign-in on this device
  useEffect(() => rememberUser({ id: user.id, name: user.name, role: user.role }), [user.id, user.name, user.role]);

  return (
    <div className="relative flex min-h-dvh bg-ground">
      {phoneOnly ? null : (
        <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
          <SideRail items={RAIL_NAV} active={active} user={user} sync={sync} />
        </div>
      )}
      <div className={cn("relative min-w-0 grow", phoneOnly && "mx-auto max-w-120")}>
        <PhoneBand className={phoneOnly ? undefined : "lg:hidden"} />
        <div className={cn("fixed inset-x-3 top-3 z-30", phoneOnly ? "mx-auto max-w-114" : "lg:hidden")}>
          <TopBar sync={sync} user={user} onAccount={() => setSheet("account")} />
        </div>
        <main
          data-shell={phoneOnly ? "phone" : "responsive"}
          className={cn("relative flex flex-col gap-4 px-4 pt-24 pb-30", !phoneOnly && "lg:gap-6 lg:px-10 lg:pt-8 lg:pb-10")}
        >
          {children}
        </main>
        <div className={cn("fixed inset-x-3 bottom-3 z-30", phoneOnly ? "mx-auto max-w-114" : "lg:hidden")}>
          <TabBar items={phoneOnly ? RECORDER_TABS : MANAGER_TABS} active={active} onPress={(id) => id === "more" && setSheet("more")} />
        </div>
      </div>
      {sheet === "account" ? <AccountSheet user={user} onClose={() => setSheet(null)} /> : null}
      {sheet === "more" ? <MoreSheet role={user.role} onClose={() => setSheet(null)} /> : null}
    </div>
  );
}
