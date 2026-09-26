"use client";
// Dev preview: stepper, chips, segmented, Set-or-overhead
import { AttributionField } from "@/components/kotila/attribution-field";
import { ChipGroup } from "@/components/kotila/chip-group";
import { Segmented } from "@/components/kotila/segmented";
import { Stepper } from "@/components/kotila/stepper";
import { PreviewSection } from "@/components/dev/preview-section";

export function EntryPreview() {
  return (
    <PreviewSection title="Entry">
      <div className="grid gap-6 sm:grid-cols-2">
        <Stepper label="Deaths today" defaultValue={4} alertAbove={3} hint="Last 7 days: 2 a day on average" />
        <Stepper label="Feed used" size="md" defaultValue={2} unit="bags" />
      </div>
      <ChipGroup label="Anything you noticed?" optional options={["Coughing", "Green stool", "Lethargy", "Panting", "Wet litter", "Poor appetite"]} defaultValue={["Wet litter"]} />
      <ChipGroup label="Cause of death" optional multiple={false} size="sm" options={["Unknown", "Disease", "Heat", "Culled", "Predator", "Crush"]} />
      <Segmented label="Water" optional options={["Low", "Normal", "High"]} defaultValue="Normal" />
      <AttributionField sets={[{ id: "set-5", label: "Set 5", meta: "Brooding · day 6" }, { id: "set-4", label: "Set 4", meta: "Growing · day 24" }]} />
      <AttributionField sets={[{ id: "set-4", label: "Set 4", meta: "Growing · day 24" }]} showError />
    </PreviewSection>
  );
}
