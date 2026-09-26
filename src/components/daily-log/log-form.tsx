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
import { useSubmitLog } from "@/hooks/queries/use-daily-logs";
import type { FeedType } from "@/hooks/queries/use-feed-types";
import { removeItem } from "@/lib/offline/outbox";
import type { PendingLog } from "@/lib/offline/pending-logs";
import type { DailyLogRow } from "@/types/daily-log";
import { farmDay } from "@/utils/format/dates";

type LogFormProps = {
  setId: string;
  // Called when the entry was saved on the phone with no signal (the screen shows the confirmation)
  onSavedHere: () => void;
  date: string;
  today: string;
  existing: DailyLogRow | undefined;
  // Not sent yet: opened again, it is changed in place on the phone
  pending?: PendingLog;
  liveBefore: number;
  yesterday: number | null;
  alertAbove: number;
  brooding: boolean;
  feedTypes: FeedType[];
  locked: string | null;
  tagHint?: string;
};

type LogValues = Partial<Pick<DailyLogRow, "deaths" | "deathCause" | "feedUnit" | "feedQty" | "feedTypeId" | "waterLevel" | "tempC" | "tags" | "note">>;

const fromLog = (log?: LogValues): LogFormValues => ({
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
  const submitLog = useSubmitLog(p.setId);
  const [rejected, setRejected] = useState<string | null>(null);
  // One id per entry (the log's own id when changing it), so resending can never make a second log
  const [clientId] = useState(() => p.existing?.clientId ?? p.pending?.clientId ?? crypto.randomUUID());
  const form = useForm<LogFormValues>({ resolver: zodResolver(logFormSchema), defaultValues: fromLog((p.pending?.payload as LogValues | undefined) ?? p.existing) });
  const [deaths, feedQty] = useWatch({ control: form.control, name: ["deaths", "feedQty"] });
  const late = p.date < p.today;
  const askReason = Boolean(p.existing && late && (deaths !== p.existing.deaths || feedQty !== p.existing.feedQty));
  const isToday = p.date === p.today;
  const pending = submitLog.isPending;
  const error = rejected ?? submitLog.error?.message ?? null;

  const submit = form.handleSubmit(async ({ reason, note, ...values }) => {
    if (askReason && !reason.trim()) return form.setError("reason", { message: "Say why you're changing this after the day." });
    const fields = { ...values, note: note.trim() || null, feedTypeId: values.feedTypeId || null };
    const change = p.existing ? { baseVersion: p.existing.version, reason: reason.trim() || undefined } : {};
    setRejected(null);
    // mutateAsync, not mutate: the form remounts as the entry reaches the phone and the server, and must still move on
    const { item, state } = await submitLog.mutateAsync({ clientId, date: p.date, ...fields, ...change });
    // No signal: confirm right here rather than load another page
    if (state === "on-phone" && !navigator.onLine) return p.onSavedHere();
    if (state !== "rejected") return router.push(`/log/${p.setId}?saved=${p.date}&state=${state}`);
    // Turned down: say why here and drop it, so the fixed entry replaces it
    setRejected(item.error?.message ?? "The farm records turned this down.");
    await removeItem(item.mutationId);
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
        {error ? <Notice tone="alert">{error}</Notice> : null}
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
