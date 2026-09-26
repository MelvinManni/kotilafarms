"use client";
// /weigh — which Set to weigh: a big button per running Set
import Link from "next/link";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useSets } from "@/hooks/queries/use-sets";
import { Icon } from "@/svgs/icon";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { farmDay } from "@/utils/format/dates";

export function WeighIndexScreen() {
  const sets = useSets();
  const running = (sets.data ?? []).filter((s) => s.status !== "closed");
  return (
    <>
      <PageHeader eyebrow={farmDay(todayInZone(FARM_TIMEZONE))} title="Weigh a Set" />
      {sets.isError ? <Notice tone="alert">{sets.error.message}</Notice> : null}
      {sets.data && running.length === 0 ? (
        <EmptyState title="No Sets running" icon="weight">Weights are kept per Set. When day-olds arrive, a manager starts a Set and it shows here.</EmptyState>
      ) : null}
      <div className="flex flex-col gap-2.5">
        {running.map((s) => (
          <Link key={s.id} href={`/weigh/${s.id}`} className="flex h-19 items-center gap-3.5 rounded-lg bg-green-600 pr-4.5 pl-5 text-white no-underline shadow-primary outline-none focus-visible:shadow-focus">
            <span className="flex grow flex-col gap-0.5">
              <strong className="text-[19px]">Weigh Set {s.number} · day {s.dayOfAge}</strong>
              <span className="text-sm text-green-100">At least 10 birds from different corners</span>
            </span>
            <span className="flex size-11 items-center justify-center rounded-full bg-white/18">
              <Icon name="chevron-right" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
