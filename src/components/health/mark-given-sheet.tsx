"use client";
// Mark a vaccine dose given on a day, or clear a dose marked by mistake
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useMarkVaccine } from "@/hooks/queries/use-health";
import type { SetVaccineRow } from "@/types/health";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { farmDay } from "@/utils/format/dates";
import { doseLabel } from "@/utils/metrics/vaccine-status";

type MarkGivenSheetProps = { setId: string; setNumber: number; vaccine: SetVaccineRow; onClose: () => void };

export function MarkGivenSheet({ setId, setNumber, vaccine: v, onClose }: MarkGivenSheetProps) {
  const mark = useMarkVaccine(setId);
  const [date, setDate] = useState(v.givenOn ?? todayInZone(FARM_TIMEZONE));
  const [note, setNote] = useState(v.note ?? "");
  const save = (givenOn: string | null) => mark.mutate({ vaccineId: v.id, givenOn, note: note.trim() || null }, { onSuccess: onClose });
  return (
    <Sheet title={`${v.item}, ${doseLabel(v.doseNo)} · Set ${setNumber}`} description={`Due day ${v.dueAgeDays}, ${farmDay(v.dueOn)} · ${v.method.toLowerCase()}`} onClose={onClose}
      footer={
        <>
          {v.givenOn ? <Button onClick={() => save(null)} disabled={mark.isPending}>Not given yet</Button> : <Button onClick={onClose}>Cancel</Button>}
          <Button variant="primary" icon="check" onClick={() => save(date)} disabled={mark.isPending}>{v.givenOn ? "Save" : "Mark as given"}</Button>
        </>
      }>
      {mark.error ? <Notice tone="alert" compact>{mark.error.message}</Notice> : null}
      <TextInput label="Given on" type="date" value={date} onChange={setDate} />
      <TextInput label="Note" optional value={note} onChange={setNote} placeholder="e.g. Batch number, or why it was late" />
    </Sheet>
  );
}
