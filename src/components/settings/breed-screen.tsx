"use client";
// Settings › Breed standard: the weight a healthy bird should reach by each day
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { BreedForm } from "@/components/settings/breed-form";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { useBreedCurve, useSaveBreedCurve } from "@/hooks/queries/use-weights";
import { useCurrentUser } from "@/lib/auth/current-user";

export function BreedScreen() {
  const role = useCurrentUser().role;
  const curve = useBreedCurve();
  // Kept here so the "Saved" note outlives the form reopening on the new points
  const save = useSaveBreedCurve();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" />
      <SettingsTabs active="breed" role={role} />
      {curve.isError ? <Notice tone="alert">{curve.error.message}</Notice> : null}
      {curve.data ? <BreedForm key={curve.data.points.map((p) => `${p.day}:${p.grams}`).join()} curve={curve.data} save={save} /> : curve.isPending ? <p className="text-body text-ink-muted">Opening the breed standard…</p> : null}
    </div>
  );
}
