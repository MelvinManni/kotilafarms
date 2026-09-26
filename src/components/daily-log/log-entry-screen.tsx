"use client";
// /log/:setId/:date — load the Set, its logs and feed types, then the form for that day
import { useSession } from "next-auth/react";
import { useState } from "react";
import { HistorySheet } from "@/components/audit/history-sheet";
import { LogForm } from "@/components/daily-log/log-form";
import { IconButton } from "@/components/kotila/icon-button";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useSetLogs } from "@/hooks/queries/use-daily-logs";
import { useFeedTypes } from "@/hooks/queries/use-feed-types";
import { useSet } from "@/hooks/queries/use-sets";
import { can } from "@/lib/auth/roles";
import { addDays } from "@/utils/dates/add-days";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { farmDay } from "@/utils/format/dates";
import { deathsAlertAbove } from "@/utils/metrics/missing-days";
import { dayOfAge } from "@/utils/metrics/mortality-trend";
import { lockedReason, recentTagHint } from "@/components/daily-log/log-entry-rules";

export function LogEntryScreen({ setId, date }: { setId: string; date: string }) {
  const user = useSession().data?.user;
  const set = useSet(setId);
  const logs = useSetLogs(setId);
  const feedTypes = useFeedTypes();
  const [history, setHistory] = useState(false);
  const today = todayInZone(FARM_TIMEZONE);
  const failed = set.error ?? logs.error ?? feedTypes.error;
  if (failed) return <Notice tone="alert">{failed.message}</Notice>;
  if (!set.data || !logs.data || !feedTypes.data || !user) return <p className="text-body text-on-deep-muted lg:text-ink-muted">Opening the log…</p>;

  const s = set.data;
  const existing = logs.data.find((l) => l.date === date);
  const dayBefore = logs.data.find((l) => l.date === addDays(date, -1));
  const liveBefore = s.liveBirds + (existing?.deaths ?? 0);
  const alertAbove = deathsAlertAbove(dayBefore?.deaths ?? null, s.deaths - (existing?.deaths ?? 0), Math.max(1, logs.data.length - (existing ? 1 : 0)));
  return (
    <>
      <PageHeader
        eyebrow={`Set ${s.number}${s.pen ? ` · ${s.pen}` : ""} · day ${dayOfAge(s.startDate, date)} · ${farmDay(date)}`}
        title={existing ? `Set ${s.number} · ${farmDay(date)}` : `Log Set ${s.number}`}
        actions={existing && can.manageOperations(user.role) ? <IconButton icon="history" label={`Edit history for ${farmDay(date)}`} onClick={() => setHistory(true)} /> : null}
      />
      <LogForm
        key={existing?.version ?? "new"}
        setId={setId}
        date={date}
        today={today}
        existing={existing}
        liveBefore={liveBefore}
        yesterday={dayBefore?.deaths ?? null}
        alertAbove={alertAbove}
        brooding={dayOfAge(s.startDate, date) <= 14}
        feedTypes={feedTypes.data}
        locked={lockedReason(user, existing, date, today)}
        tagHint={recentTagHint(logs.data, date)}
      />
      {history && existing ? (
        <HistorySheet table="daily_logs" rowId={existing.id} title={`Edit history · ${farmDay(date)} log`} description={`Set ${s.number} · first logged by ${existing.createdBy.name}`} onClose={() => setHistory(false)} />
      ) : null}
    </>
  );
}
