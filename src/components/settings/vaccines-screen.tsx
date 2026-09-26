"use client";
// Settings › Vaccine schedule
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { VaccineScheduleForm } from "@/components/settings/vaccine-schedule-form";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { useSaveVaccineSchedule, useVaccineSchedule } from "@/hooks/queries/use-health";
import { useCurrentUser } from "@/lib/auth/current-user";

export function VaccinesScreen() {
  const role = useCurrentUser().role;
  const schedule = useVaccineSchedule();
  // Kept here so the "Saved" note outlives the form reopening on the saved rows
  const save = useSaveVaccineSchedule();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" />
      <SettingsTabs active="vaccines" role={role} />
      {schedule.isError ? <Notice tone="alert">{schedule.error.message}</Notice> : null}
      {schedule.data ? <VaccineScheduleForm key={schedule.data.map((r) => `${r.id}:${r.item}:${r.doseNo}:${r.dueAgeDays}:${r.method}`).join()} rows={schedule.data} save={save} /> : schedule.isPending ? <p className="text-body text-ink-muted">Opening the schedule…</p> : null}
    </div>
  );
}
