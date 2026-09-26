"use client";
// /log/:setId — the Set's days, missed-day notices, and a confirmation after saving
import { useSearchParams } from "next/navigation";
import { LogTable } from "@/components/daily-log/log-table";
import { MissedDays } from "@/components/daily-log/missed-days";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useMissingDays, useSetLogs } from "@/hooks/queries/use-daily-logs";
import { useSet } from "@/hooks/queries/use-sets";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { count } from "@/utils/format/count";
import { farmDay } from "@/utils/format/dates";

export function SetLogScreen({ setId }: { setId: string }) {
  const saved = useSearchParams().get("saved");
  const set = useSet(setId);
  const logs = useSetLogs(setId);
  const missing = useMissingDays(setId);
  const today = todayInZone(FARM_TIMEZONE);
  const failed = set.error ?? logs.error;
  if (failed) return <Notice tone="alert">{failed.message}</Notice>;
  if (!set.data || !logs.data) return <p className="text-body text-on-deep-muted lg:text-ink-muted">Loading the log…</p>;
  const s = set.data;
  const end = s.closedOn && s.closedOn < today ? s.closedOn : today;
  const loggedToday = logs.data.some((l) => l.date === today);
  return (
    <>
      <PageHeader
        eyebrow={`${s.pen ? `${s.pen} · ` : ""}${count(s.liveBirds)} live birds · day ${s.dayOfAge}`}
        title={`Daily log · Set ${s.number}`}
        actions={s.status !== "closed" && !loggedToday ? <Button variant="primary" icon="plus" href={`/log/${s.id}/${today}`}>Log today</Button> : null}
      />
      {saved ? <Notice tone="success" title={`Saved: Set ${s.number}, ${farmDay(saved)}`}>It counts straight away on Today and in the Set.</Notice> : null}
      {missing.data?.length ? <MissedDays setId={s.id} setNumber={s.number} days={missing.data} /> : null}
      <Panel flush title="Last 14 days" subtitle="Select a day to open it. Edited days keep their history.">
        <LogTable setId={s.id} startDate={s.startDate} endDate={end} today={today} logs={logs.data} />
      </Panel>
    </>
  );
}
