"use client";
// The last week of daily logs on the Set page, with a link to every day
import { LogTable } from "@/components/daily-log/log-table";
import { Panel } from "@/components/kotila/panel";
import { useSetLogs } from "@/hooks/queries/use-daily-logs";
import { useOutboxItems } from "@/hooks/use-outbox-items";
import { useCurrentUser } from "@/lib/auth/current-user";
import { pendingLogsFor } from "@/lib/offline/pending-logs";
import type { SetDetail } from "@/types/sets";

export function SetLogsPanel({ set, today }: { set: SetDetail; today: string }) {
  const logs = useSetLogs(set.id);
  const pending = pendingLogsFor(useOutboxItems(useCurrentUser().id), set.id);
  const end = set.closedOn && set.closedOn < today ? set.closedOn : today;
  return (
    <Panel flush title="Daily logs" subtitle={`${set.counts.logs} logged`} action={{ label: "All days", href: `/log/${set.id}` }}>
      {logs.data ? <LogTable setId={set.id} startDate={set.startDate} endDate={end} today={today} logs={logs.data} pending={pending} days={7} /> : <p className="px-6 pb-5 text-body text-ink-muted">Loading logs…</p>}
    </Panel>
  );
}
