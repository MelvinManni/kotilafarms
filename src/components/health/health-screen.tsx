"use client";
// /health: the most pressing vaccine, each running Set's schedule, and drugs and supplements given
import { useState } from "react";
import { MarkGivenSheet } from "@/components/health/mark-given-sheet";
import { SchedulePanel } from "@/components/health/schedule-panel";
import { SetScheduleSheet } from "@/components/health/set-schedule-sheet";
import { TreatmentSheet } from "@/components/health/treatment-sheet";
import { TreatmentsPanel } from "@/components/health/treatments-panel";
import { Button } from "@/components/kotila/button";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { useHealthRecords, useRunningVaccines } from "@/hooks/queries/use-health";
import { useSets } from "@/hooks/queries/use-sets";
import type { SetVaccineRow } from "@/types/health";
import { mostPressingVaccine, vaccineNotice } from "@/utils/metrics/health-headlines";

export function HealthScreen() {
  const sets = useSets();
  const running = (sets.data ?? []).filter((s) => s.status !== "closed");
  const vaccines = useRunningVaccines(running.map((s) => s.id));
  const records = useHealthRecords();
  const [marking, setMarking] = useState<{ setId: string; setNumber: number; vaccine: SetVaccineRow } | null>(null);
  const [treating, setTreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const due = running.flatMap((s, i) => (vaccines[i]?.data ?? []).map((vaccine) => ({ setId: s.id, setNumber: s.number, liveBirds: s.liveBirds, vaccine })));
  const pressing = mostPressingVaccine(due);
  const editingIndex = running.findIndex((s) => s.id === editing);
  const editingSet = running[editingIndex];
  const editingVaccines = vaccines[editingIndex]?.data;
  const notice = pressing ? vaccineNotice(pressing) : null;
  const failed = sets.error ?? records.error ?? vaccines.find((q) => q.error)?.error;
  return (
    <>
      <PageHeader
        eyebrow={sets.data ? `${running.length} running ${running.length === 1 ? "Set" : "Sets"}` : undefined}
        title="Health and vaccines"
        actions={
          <>
            <Button icon="edit" href="/settings/vaccines">Edit vaccine schedule</Button>
            <Button variant="primary" icon="syringe" onClick={() => setTreating(true)} disabled={running.length === 0}>Record a treatment</Button>
          </>
        }
      />
      {failed ? <Notice tone="alert">{failed.message}</Notice> : null}
      {notice && pressing ? (
        <Notice tone={pressing.vaccine.state === "late" ? "alert" : "warning"} icon="syringe" title={notice.title} action={{ label: "Mark as given", onClick: () => setMarking(pressing) }}>{notice.body}</Notice>
      ) : null}
      {sets.data && running.length === 0 ? (
        <EmptyState title="No Sets running" icon="health" action={{ label: "Start a new Set", icon: "plus", href: "/sets" }}>Each Set gets the vaccine schedule when it starts. Its doses and treatments show here.</EmptyState>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        {running.map((s, i) => (
          <SchedulePanel key={s.id} set={s} vaccines={vaccines[i]?.data} onOpen={(vaccine) => setMarking({ setId: s.id, setNumber: s.number, vaccine })} onEdit={() => setEditing(s.id)} />
        ))}
      </div>
      {records.data ? <TreatmentsPanel rows={records.data} onRecord={() => setTreating(true)} /> : null}
      {marking ? <MarkGivenSheet {...marking} onClose={() => setMarking(null)} /> : null}
      {editingSet && editingVaccines ? <SetScheduleSheet setId={editingSet.id} setNumber={editingSet.number} vaccines={editingVaccines} onClose={() => setEditing(null)} /> : null}
      {treating ? <TreatmentSheet sets={running} onClose={() => setTreating(false)} /> : null}
    </>
  );
}
