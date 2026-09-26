// Weight against the breed standard for a one-Set report, with a plain note
import { GrowthChart } from "@/components/kotila/charts/growth-chart";
import { GrowthLegend } from "@/components/kotila/charts/growth-legend";
import { ReportSection } from "@/components/reports/report-section";
import type { SetReportPayload } from "@/types/report";
import { growthNote } from "@/utils/metrics/report-headlines";

export function ReportGrowth({ growth, setNumber }: { growth: NonNullable<SetReportPayload["growth"]>; setNumber: number }) {
  const samples = growth.samples.map((s) => ({ day: s.day, kg: s.grams / 1000 }));
  return (
    <ReportSection title="Weight against the breed standard">
      <GrowthLegend theme="light" />
      {samples.length ? (
        <GrowthChart theme="light" samples={samples} standard={growth.standard.map((p) => ({ day: p.day, kg: p.grams / 1000 }))} lateFrom={null} callout={false} maxKg={Math.max(3, ...samples.map((s) => Math.ceil(s.kg)))} ariaLabel={`Set ${setNumber} average weight by day of age against the breed standard`} />
      ) : null}
      <p className="m-0 text-body text-ink-2">{growthNote(growth, setNumber)}</p>
    </ReportSection>
  );
}
