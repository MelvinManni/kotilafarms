"use client";
// /weigh — which Set to weigh: a big button per running Set
import { EmptyState } from "@/components/kotila/empty-state";
import { SetActionLink } from "@/components/kotila/set-action-link";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useSets } from "@/hooks/queries/use-sets";
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
          <SetActionLink key={s.id} href={`/weigh/${s.id}`} title={`Weigh Set ${s.number} · day ${s.dayOfAge}`} detail="At least 10 birds from different corners" />
        ))}
      </div>
    </>
  );
}
