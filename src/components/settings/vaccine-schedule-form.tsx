"use client";
// Default vaccine schedule editor: new Sets copy it when they start; running Sets keep theirs
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { VaccineRow } from "@/components/settings/vaccine-row";
import type { useSaveVaccineSchedule } from "@/hooks/queries/use-health";
import { vaccineScheduleSchema, type VaccineSchedule } from "@/schemas/health";
import type { ScheduleDefault } from "@/types/health";

type Props = { rows: ScheduleDefault[]; save: ReturnType<typeof useSaveVaccineSchedule> };

export function VaccineScheduleForm({ rows, save }: Props) {
  const form = useForm<VaccineSchedule>({ resolver: zodResolver(vaccineScheduleSchema), defaultValues: { rows } });
  const list = useFieldArray({ control: form.control, name: "rows", keyName: "key" });
  return (
    <form onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate>
      <Panel variant="raised" title="Vaccine schedule" subtitle="Every new Set gets these doses on these days of age. Sets already running keep their own schedule.">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_1.4fr_44px] gap-2 text-caption font-semibold text-ink-muted">
            <span>Vaccine</span><span>Dose</span><span>Day of age</span><span>How it’s given</span>
          </div>
          {list.fields.map((f, i) => (
            <VaccineRow key={f.key} index={i} register={form.register} errors={form.formState.errors.rows?.[i]} onRemove={() => list.remove(i)} />
          ))}
          {list.fields.length === 0 ? <p className="m-0 text-body text-ink-muted">No doses. New Sets will start with an empty schedule.</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button icon="plus" onClick={() => list.append({ item: "", doseNo: 1, dueAgeDays: 7, method: "Drinking water" })}>Add a dose</Button>
          <Button type="submit" variant="primary" icon="check" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save the schedule"}</Button>
        </div>
        {save.isError ? <Notice tone="alert">{save.error.message}</Notice> : null}
        {save.isSuccess ? <Notice tone="success" compact>Saved. New Sets will start with this schedule.</Notice> : null}
      </Panel>
    </form>
  );
}
