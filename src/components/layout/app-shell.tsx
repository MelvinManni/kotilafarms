"use client";
// App frame: side rail on desktop; green band, top bar and tab bar on phones (recorders always get the phone frame)
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { SyncRunner } from "@/components/offline/sync-runner";
import { SyncSheet } from "@/components/offline/sync-sheet";
import { AccountSheet } from "@/components/layout/account-sheet";
import { MoreSheet } from "@/components/layout/more-sheet";
import { PhoneBand } from "@/components/layout/phone-band";
import { SideRail } from "@/components/layout/side-rail";
import { TabBar } from "@/components/layout/tab-bar";
import { TopBar } from "@/components/layout/top-bar";
import { MANAGER_TABS, RAIL_NAV, RECORDER_TABS, activeNavId } from "@/constants/nav";
import { useConflicts } from "@/hooks/queries/use-conflicts";
import { useOutstanding } from "@/hooks/queries/use-sales";
import { useSyncSummary } from "@/hooks/use-sync-summary";
import { CurrentUserProvider } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/roles";
import { rememberUser } from "@/lib/offline/remembered-user";
import type { SessionUser } from "@/types/session";
import { cn } from "@/utils/cn";

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const conflicts = useConflicts(can.manageOperations(user.role));
  const sync = useSyncSummary(user.id, conflicts.data?.length ?? 0);
  const [sheet, setSheet] = useState<"account" | "more" | "sync" | null>(null);
  const phoneOnly = user.role === "recorder";
  const active = activeNavId(pathname);
  // Owed balances show as a badge on Sales for people who see money
  const owed = useOutstanding(can.seeMoney(user.role));
  const buyersOwing = owed.data?.buyers ?? 0;
  const badges = buyersOwing ? { sales: { count: buyersOwing, title: `${buyersOwing} ${buyersOwing === 1 ? "buyer owes" : "buyers owe"} money` } } : undefined;
  const syncWithAction = { ...sync, onClick: () => setSheet("sync") };

  // Keep this person available for offline sign-in, and ask the browser not to clear the outbox
  useEffect(() => {
    rememberUser({ id: user.id, name: user.name, email: user.email, role: user.role });
    void navigator.storage?.persist?.();
  }, [user.id, user.name, user.email, user.role]);

  return (
    <CurrentUserProvider user={user}>
      <SyncRunner userId={user.id} />
      <div className="relative flex min-h-dvh bg-ground">
        {phoneOnly ? null : (
          <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
            <SideRail items={RAIL_NAV} active={active} user={user} sync={syncWithAction} badges={badges} />
          </div>
        )}
        <div className={cn("relative min-w-0 grow", phoneOnly && "mx-auto max-w-120")}>
          <PhoneBand className={phoneOnly ? undefined : "lg:hidden"} />
          <div className={cn("fixed inset-x-3 top-3 z-30", phoneOnly ? "mx-auto max-w-114" : "lg:hidden")}>
            <TopBar sync={syncWithAction} user={user} onAccount={() => setSheet("account")} />
          </div>
          <main data-shell={phoneOnly ? "phone" : "responsive"} className={cn("relative flex flex-col gap-4 px-4 pt-24 pb-30", !phoneOnly && "lg:gap-6 lg:px-10 lg:pt-8 lg:pb-10")}>
            {children}
          </main>
          <div className={cn("fixed inset-x-3 bottom-3 z-30", phoneOnly ? "mx-auto max-w-114" : "lg:hidden")}>
            <TabBar items={phoneOnly ? RECORDER_TABS : MANAGER_TABS} active={active} onPress={(id) => id === "more" && setSheet("more")} />
          </div>
        </div>
        {sheet === "account" ? <AccountSheet user={user} onClose={() => setSheet(null)} /> : null}
        {sheet === "more" ? <MoreSheet role={user.role} onClose={() => setSheet(null)} /> : null}
        {sheet === "sync" ? <SyncSheet user={user} onClose={() => setSheet(null)} /> : null}
      </div>
    </CurrentUserProvider>
  );
}
