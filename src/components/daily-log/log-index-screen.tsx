"use client";
// /log — which Set to log: a big button per running Set, and a link to all its days
import Link from "next/link";
import { LogTodayLinks } from "@/components/daily-log/log-today-links";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useSets } from "@/hooks/queries/use-sets";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { farmDay } from "@/utils/format/dates";

export function LogIndexScreen() {
  const sets = useSets();
  const today = todayInZone(FARM_TIMEZONE);
  const running = (sets.data ?? []).filter((s) => s.status !== "closed");
  return (
    <>
      <PageHeader eyebrow={farmDay(today)} title="Log today" />
      {sets.isError ? <Notice tone="alert">{sets.error.message}</Notice> : null}
      {sets.data && running.length === 0 ? (
        <EmptyState title="No Sets running" icon="log">Logs are kept per Set. When day-olds arrive, a manager starts a Set and it shows here.</EmptyState>
      ) : null}
      <LogTodayLinks sets={running} today={today} />
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {running.map((s) => (
          <Link key={s.id} href={`/log/${s.id}`} className="py-1 text-sm font-semibold text-green-700">
            All days for Set {s.number}
          </Link>
        ))}
      </div>
    </>
  );
}
