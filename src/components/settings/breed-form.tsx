"use client";
// Breed curve editor: a row per day of age with the standard weight in grams, and a preview chart
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/kotila/button";
import { GrowthChart } from "@/components/kotila/charts/growth-chart";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { BreedRow } from "@/components/settings/breed-row";
import type { BreedCurve, useSaveBreedCurve } from "@/hooks/queries/use-weights";
import { breedCurveSchema } from "@/schemas/weight";
import type * as z from "zod/mini";

type Values = z.input<typeof breedCurveSchema>;

export function BreedForm({ curve, save }: { curve: BreedCurve; save: ReturnType<typeof useSaveBreedCurve> }) {
  const form = useForm<Values>({ resolver: zodResolver(breedCurveSchema), defaultValues: { points: curve.points } });
  const rows = useFieldArray({ control: form.control, name: "points" });
  const points = useWatch({ control: form.control, name: "points" }) ?? [];
  const chart = points.filter((p) => Number.isFinite(p.day) && Number.isFinite(p.grams)).sort((a, b) => a.day - b.day).map((p) => ({ day: p.day, kg: p.grams / 1000 }));
  const listError = form.formState.errors.points?.root?.message ?? form.formState.errors.points?.message;
  const nextDay = Math.min(70, Math.max(0, ...points.map((p) => p.day || 0)) + 7);

  return (
    <form onSubmit={form.handleSubmit((v) => save.mutate(v.points))} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <Panel variant="raised" title={curve.name} subtitle="Weight a healthy bird should reach by each day. Every Set and chart measures against this.">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_1fr_44px] gap-2 text-caption font-semibold text-ink-muted">
            <span>Day of age</span>
            <span>Standard (g)</span>
          </div>
          {rows.fields.map((f, i) => (
            <BreedRow key={f.id} index={i} register={form.register} errors={form.formState.errors.points?.[i]} onRemove={rows.fields.length > 2 ? () => rows.remove(i) : undefined} />
          ))}
        </div>
        {listError ? <Notice tone="alert" compact>{listError}</Notice> : null}
        <div className="flex flex-wrap gap-3">
          <Button icon="plus" onClick={() => rows.append({ day: nextDay, grams: points.at(-1)?.grams ?? 1000 })}>Add a day</Button>
          <Button type="submit" variant="primary" icon="check" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save the standard"}</Button>
        </div>
        {save.isError ? <Notice tone="alert">{save.error.message}</Notice> : null}
        {save.isSuccess && !form.formState.isDirty ? <Notice tone="success" compact>Saved. Every Set now measures against this.</Notice> : null}
      </Panel>
      <Panel variant="raised" title="How it looks" subtitle="Dashed line is the standard; the band is ±5%.">
        <GrowthChart theme="light" samples={[]} standard={chart} callout={false} ariaLabel="Breed standard curve by day of age" />
      </Panel>
    </form>
  );
}
