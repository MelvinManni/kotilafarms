"use client";
// Record a treatment: which Set, when, what (quick picks for the usual items), how much, cost, and why
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { ChipGroup } from "@/components/kotila/chip-group";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { HEALTH_ITEMS } from "@/constants/health-items";
import { useAddHealthRecord } from "@/hooks/queries/use-health";
import { fieldErrors } from "@/schemas/field-errors";
import { healthRecordCreateSchema } from "@/schemas/health";
import type { SetSummary } from "@/types/sets";
import { todayInZone } from "@/utils/dates/today-in-zone";

export function TreatmentSheet({ sets, onClose }: { sets: SetSummary[]; onClose: () => void }) {
  const add = useAddHealthRecord();
  const [clientId] = useState(() => crypto.randomUUID());
  const [setId, setSetId] = useState(sets.length === 1 ? sets[0]!.id : "");
  const [date, setDate] = useState(() => todayInZone(FARM_TIMEZONE));
  const [item, setItem] = useState("");
  const [dose, setDose] = useState("");
  const [cost, setCost] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const result = healthRecordCreateSchema.safeParse({ clientId, setId, date, item, dose, cost, reason });
    if (!result.success) return setErrors(fieldErrors(result.error));
    setErrors({});
    add.mutate(result.data, { onSuccess: onClose });
  };

  return (
    <Sheet wide title="Record a treatment" description="Drugs, vaccines outside the schedule, and supplements: what, how much, the cost and why." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={save} disabled={add.isPending}>{add.isPending ? "Saving…" : "Save treatment"}</Button></>}>
      {add.error ? <Notice tone="alert" compact>{add.error.message}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Set" required placeholder="Choose the Set" options={sets.map((s) => ({ value: s.id, label: `Set ${s.number} · day ${s.dayOfAge}` }))} value={setId || undefined} onChange={setSetId} error={errors.setId} />
        <TextInput label="Date" type="date" value={date} onChange={setDate} error={errors.date} />
      </div>
      <ChipGroup label="Usual items" optional size="sm" options={HEALTH_ITEMS} value={HEALTH_ITEMS.includes(item) ? item : undefined} onChange={(v) => setItem(String(v ?? ""))} />
      <TextInput label="What was given" required value={item} onChange={setItem} placeholder="e.g. Oxytetracycline" error={errors.item} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Amount / dose" required value={dose} onChange={setDose} placeholder="e.g. 100 g in drinking water · 3 days" error={errors.dose} />
        <MoneyInput label="Cost" value={cost} onChange={setCost} hint="Optional · saved as a Drugs and vaccines expense on the Set" />
      </div>
      <TextInput label="Why" required multiline value={reason} onChange={setReason} placeholder="e.g. Wet litter 3 days, 4 deaths this week" error={errors.reason} />
    </Sheet>
  );
}
