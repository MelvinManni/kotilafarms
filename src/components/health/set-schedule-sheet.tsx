"use client";
// Change one Set's schedule: move a due day, add a dose, drop one not given yet; the farm defaults stay as they are
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { SetDoseRow } from "@/components/health/set-dose-row";
import { Button } from "@/components/kotila/button";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { useSaveSetSchedule } from "@/hooks/queries/use-health";
import { setScheduleSchema, type SetSchedule } from "@/schemas/health";
import type { SetVaccineRow } from "@/types/health";

type Props = { setId: string; setNumber: number; vaccines: SetVaccineRow[]; onClose: () => void };

export function SetScheduleSheet({ setId, setNumber, vaccines, onClose }: Props) {
  const save = useSaveSetSchedule(setId);
  const form = useForm<SetSchedule>({
    resolver: zodResolver(setScheduleSchema),
    defaultValues: { rows: vaccines.map((v) => ({ id: v.id, item: v.item, doseNo: v.doseNo, dueAgeDays: v.dueAgeDays, version: v.version })), reason: "" },
  });
  const rows = useFieldArray({ control: form.control, name: "rows", keyName: "key" });
  const reason = useWatch({ control: form.control, name: "reason" }) ?? "";
  const givenOn = (id?: string) => vaccines.find((v) => v.id === id)?.givenOn ?? null;
  const submit = form.handleSubmit((v) => save.mutate({ ...v, reason: v.reason?.trim() || undefined }, { onSuccess: onClose }));
  return (
    <Sheet wide title={`Vaccine schedule · Set ${setNumber}`} description="Changes this Set only. New Sets still start from the farm schedule in Settings." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" disabled={save.isPending} onClick={() => void submit()}>{save.isPending ? "Saving…" : "Save schedule"}</Button></>}>
      {save.error ? <Notice tone="alert" compact>{save.error.message}</Notice> : null}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1.6fr_0.7fr_0.9fr_44px] gap-2 text-caption font-semibold text-ink-muted">
          <span>Vaccine</span><span>Dose</span><span>Due on day</span>
        </div>
        {rows.fields.map((f, i) => (
          <SetDoseRow key={f.key} index={i} given={givenOn(f.id)} register={form.register} errors={form.formState.errors.rows?.[i]} onRemove={() => rows.remove(i)} />
        ))}
        {rows.fields.length === 0 ? <p className="m-0 text-body text-ink-muted">No doses on this Set’s schedule.</p> : null}
      </div>
      <div>
        <Button icon="plus" onClick={() => rows.append({ item: "", doseNo: 1, dueAgeDays: 7 })}>Add a dose</Button>
      </div>
      <TextInput label="Why the change" optional value={reason} onChange={(v) => form.setValue("reason", v)} placeholder="e.g. Vet moved Gumboro to day 12" />
    </Sheet>
  );
}
