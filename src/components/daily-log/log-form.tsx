"use client";
// The day's log form: deaths first, then feed, water, what was seen, notes; saves or edits
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { DeathsPanel } from "@/components/daily-log/deaths-panel";
import { FeedPanel } from "@/components/daily-log/feed-panel";
import { logFormSchema, type LogFormValues } from "@/components/daily-log/log-form-schema";
import { NotesPanel } from "@/components/daily-log/notes-panel";
import { PenPanel } from "@/components/daily-log/pen-panel";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { useEditLog, useSaveLog } from "@/hooks/queries/use-daily-logs";
import type { FeedType } from "@/hooks/queries/use-feed-types";
import type { DailyLogRow } from "@/types/daily-log";
import { farmDay } from "@/utils/format/dates";

type LogFormProps = {
  setId: string;
  date: string;
  today: string;
  existing: DailyLogRow | undefined;
  liveBefore: number;
  yesterday: number | null;
  alertAbove: number;
  brooding: boolean;
  feedTypes: FeedType[];
  locked: string | null;
  tagHint?: string;
};

const fromLog = (log?: DailyLogRow): LogFormValues => ({
  deaths: log?.deaths ?? 0,
  deathCause: (log?.deathCause as LogFormValues["deathCause"]) ?? null,
  feedUnit: log?.feedUnit ?? "bags",
  feedQty: log?.feedQty ?? null,
  feedTypeId: log?.feedTypeId ?? null,
  waterLevel: log?.waterLevel ?? null,
  tempC: log?.tempC ?? null,
  tags: (log?.tags as LogFormValues["tags"]) ?? [],
  note: log?.note ?? "",
  reason: "",
});

export function LogForm(p: LogFormProps) {
  const router = useRouter();
  const save = useSaveLog(p.setId);
  const edit = useEditLog(p.setId);
  // One id per entry, so resending the same entry can never make a second log
  const [clientId] = useState(() => crypto.randomUUID());
  const form = useForm<LogFormValues>({ resolver: zodResolver(logFormSchema), defaultValues: fromLog(p.existing) });
  const [deaths, feedQty] = useWatch({ control: form.control, name: ["deaths", "feedQty"] });
  const late = p.date < p.today;
  const askReason = Boolean(p.existing && late && (deaths !== p.existing.deaths || feedQty !== p.existing.feedQty));
  const isToday = p.date === p.today;
  const pending = save.isPending || edit.isPending;
  const error = save.error ?? edit.error;

  const submit = form.handleSubmit(({ reason, note, ...values }) => {
    if (askReason && !reason.trim()) return form.setError("reason", { message: "Say why you're changing this after the day." });
    const fields = { ...values, note: note.trim() || null };
    const done = () => router.push(`/log/${p.setId}?saved=${p.date}`);
    if (p.existing) edit.mutate({ id: p.existing.id, ...fields, baseVersion: p.existing.version, reason: reason.trim() || undefined }, { onSuccess: done });
    else save.mutate({ clientId, date: p.date, ...fields }, { onSuccess: done });
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {p.locked ? <Notice tone="warning" icon="lock">{p.locked}</Notice> : null}
        <fieldset disabled={Boolean(p.locked)} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
          <DeathsPanel liveBefore={p.liveBefore} isToday={isToday} yesterday={p.yesterday} alertAbove={p.alertAbove} />
          <FeedPanel feedTypes={p.feedTypes} />
          <PenPanel tagHint={p.tagHint} />
          <NotesPanel brooding={p.brooding} askReason={askReason} />
        </fieldset>
        {error ? <Notice tone="alert">{error.message}</Notice> : null}
        {p.locked ? null : (
          <div className="flex flex-col items-center gap-2 pt-2">
            <Button type="submit" variant="primary" size="xl" full icon="check" disabled={pending}>
              {pending ? "Saving…" : p.existing ? "Save changes" : isToday ? "Save today’s log" : `Save ${farmDay(p.date)}`}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
