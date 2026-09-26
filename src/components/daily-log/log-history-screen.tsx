"use client";
// /log/history — recent days for each running Set (the recorder's History tab)
import { LogTable } from "@/components/daily-log/log-table";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useSetLogs } from "@/hooks/queries/use-daily-logs";
import { useSets } from "@/hooks/queries/use-sets";
import { useOutboxItems } from "@/hooks/use-outbox-items";
import { useCurrentUser } from "@/lib/auth/current-user";
import { pendingLogsFor } from "@/lib/offline/pending-logs";
import type { SetSummary } from "@/types/sets";
import { todayInZone } from "@/utils/dates/today-in-zone";

function SetHistory({ set, today }: { set: SetSummary; today: string }) {
  const logs = useSetLogs(set.id);
  const pending = pendingLogsFor(useOutboxItems(useCurrentUser().id), set.id);
  return (
    <Panel flush title={`Set ${set.number}`} subtitle="Last 7 days">
      {logs.data ? <LogTable setId={set.id} startDate={set.startDate} endDate={today} today={today} logs={logs.data} pending={pending} days={7} /> : <p className="px-6 pb-5 text-body text-ink-muted">Loading…</p>}
    </Panel>
  );
}

export function LogHistoryScreen() {
  const sets = useSets();
  const today = todayInZone(FARM_TIMEZONE);
  return (
    <>
      <PageHeader title="History" eyebrow="What was logged this week" />
      {sets.isError ? <Notice tone="alert">{sets.error.message}</Notice> : null}
      {(sets.data ?? []).filter((s) => s.status !== "closed").map((s) => <SetHistory key={s.id} set={s} today={today} />)}
    </>
  );
}
