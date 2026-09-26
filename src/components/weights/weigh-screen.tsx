"use client";
// /weigh/:setId — load the Set and its samples, then the weigh form for today
import { useState } from "react";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { SavedOnPhone } from "@/components/offline/saved-on-phone";
import { WeighDone } from "@/components/weights/weigh-done";
import { WeighForm, type WeighSaved } from "@/components/weights/weigh-form";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useSet } from "@/hooks/queries/use-sets";
import { useSetWeights } from "@/hooks/queries/use-weights";
import { useCurrentUser } from "@/lib/auth/current-user";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { farmDay } from "@/utils/format/dates";
import { dayOfAge } from "@/utils/metrics/mortality-trend";

export function WeighScreen({ setId }: { setId: string }) {
  const user = useCurrentUser();
  const set = useSet(setId);
  const weights = useSetWeights(setId);
  const [saved, setSaved] = useState<WeighSaved | null>(null);
  const today = todayInZone(FARM_TIMEZONE);
  const failed = set.error ?? weights.error;
  if (failed) return <Notice tone="alert">{failed.message}</Notice>;
  if (!set.data || !weights.data) return <p className="text-body text-on-deep-muted lg:text-ink-muted">Opening the scale…</p>;

  const s = set.data;
  const ageDays = dayOfAge(s.startDate, today);
  return (
    <>
      <PageHeader eyebrow={`Set ${s.number}${s.pen ? ` · ${s.pen}` : ""} · day ${ageDays} · ${farmDay(today)}`} title={`Weigh Set ${s.number}`} />
      {s.status === "closed" ? <Notice tone="neutral" icon="lock">Set {s.number} is closed. Weights can only be added to a running Set.</Notice> : null}
      {saved?.onPhone ? (
        <SavedOnPhone what={`Set ${s.number} weights, ${farmDay(today)}`} more={{ href: "/weigh", label: "Weigh another Set" }} />
      ) : saved ? (
        <WeighDone setNumber={s.number} saved={saved} />
      ) : s.status === "closed" ? null : (
        <WeighForm setId={setId} setNumber={s.number} date={today} ageDays={ageDays} liveBirds={s.liveBirds} weights={weights.data} by={user.name} onSaved={setSaved} />
      )}
    </>
  );
}
