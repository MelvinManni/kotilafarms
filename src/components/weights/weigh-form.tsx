"use client";
// Weigh a Set: type each bird, see the figures move, save the sample through the outbox
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { SampleChart } from "@/components/weights/sample-chart";
import { SampleFigures } from "@/components/weights/sample-figures";
import { WeightEntry, type Bird } from "@/components/weights/weight-entry";
import { useSubmitWeights } from "@/hooks/queries/use-weights";
import { removeItem } from "@/lib/offline/outbox";
import type { SetWeights } from "@/types/weight";
import { farmDay } from "@/utils/format/dates";
import { MIN_SAMPLE_BIRDS } from "@/utils/metrics/weight-sample";
import { sampleStats } from "@/utils/metrics/sample-stats";
import { findRepeat } from "@/utils/metrics/find-repeat";

type WeighFormProps = { setId: string; setNumber: number; date: string; ageDays: number; liveBirds: number; weights: SetWeights; by: string; onSaved: (saved: WeighSaved) => void };

export type WeighSaved = { onPhone: boolean; count: number; averageGrams: number };

export function WeighForm(p: WeighFormProps) {
  const submit = useSubmitWeights(p.setId);
  // One id per sample, so a resend can never make a second one
  const [clientId] = useState(() => crypto.randomUUID());
  const [birds, setBirds] = useState<Bird[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [repeatOk, setRepeatOk] = useState(false);
  const grams = birds.map((b) => b.grams);
  const earlier = p.weights.samples.filter((s) => s.ageDays < p.ageDays || (s.ageDays === p.ageDays && grams.length === 0));
  const stats = sampleStats(grams, p.ageDays, p.weights.standard, earlier.at(-1));
  const repeat = repeatOk ? null : findRepeat(p.weights.samples, p.date, grams);
  const points = [...earlier.map((s) => ({ day: s.ageDays, grams: s.averageGrams })), ...(grams.length ? [{ day: p.ageDays, grams: stats.averageGrams }] : [])];

  const save = async () => {
    if (repeat) return;
    setError(null);
    const { item, state } = await submit.mutateAsync({ clientId, date: p.date, weightsGrams: grams });
    if (state !== "rejected") return p.onSaved({ onPhone: state === "on-phone", count: grams.length, averageGrams: stats.averageGrams });
    setError(item.error?.message ?? "The farm records turned this down.");
    await removeItem(item.mutationId);
  };

  return (
    <div className="flex flex-col gap-4">
      <SampleFigures stats={stats} ageDays={p.ageDays} liveBirds={p.liveBirds} />
      <Notice tone={grams.length > 0 && grams.length < MIN_SAMPLE_BIRDS ? "warning" : "neutral"} compact>
        {grams.length > 0 && grams.length < MIN_SAMPLE_BIRDS ? `Only ${grams.length} of the ${MIN_SAMPLE_BIRDS} birds asked for. You can still save.` : `Weigh at least ${MIN_SAMPLE_BIRDS} birds from different corners.`}
      </Notice>
      <WeightEntry birds={birds} onChange={(b) => (setBirds(b), setRepeatOk(false))} disabled={submit.isPending} />
      <SampleChart setNumber={p.setNumber} standard={p.weights.standard} samples={points} ageDays={p.ageDays} />
      {repeat ? (
        <Notice tone="warning" title={`This looks already recorded by ${repeat.by}`} action={{ label: "Save anyway", onClick: () => setRepeatOk(true) }}>
          The same {repeat.count} weights were saved for {farmDay(p.date)}.
        </Notice>
      ) : null}
      {error ? <Notice tone="alert">{error}</Notice> : null}
      <div className="flex flex-col items-stretch gap-2.5 pt-2">
        <Button variant="primary" size="xl" full icon="check" disabled={grams.length === 0 || submit.isPending || Boolean(repeat)} onClick={() => void save()}>
          {submit.isPending ? "Saving…" : `Save sample (${grams.length} ${grams.length === 1 ? "bird" : "birds"})`}
        </Button>
        <span className="text-center text-caption font-medium text-ink-muted">Weighed by {p.by} · {farmDay(p.date)}</span>
      </div>
    </div>
  );
}
