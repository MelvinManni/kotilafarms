"use client";
// Water and what was seen in the pen
import { Controller, useFormContext } from "react-hook-form";
import { ChipGroup } from "@/components/kotila/chip-group";
import { Panel } from "@/components/kotila/panel";
import { Segmented } from "@/components/kotila/segmented";
import { OBSERVATION_TAGS } from "@/constants/observation-tags";
import type { LogFormValues } from "@/components/daily-log/log-form-schema";

export function PenPanel({ tagHint }: { tagHint?: string }) {
  const { control } = useFormContext<LogFormValues>();
  return (
    <>
      <Panel variant="raised" title="Water">
        <Controller
          control={control}
          name="waterLevel"
          render={({ field }) => (
            <Segmented label="How much did they drink?" optional options={[{ value: "low", label: "Low" }, { value: "normal", label: "Normal" }, { value: "high", label: "High" }]} value={field.value ?? undefined} onChange={field.onChange} />
          )}
        />
      </Panel>
      <Panel variant="raised" title="Seen in the pen">
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <ChipGroup label="Tap anything you saw" optional size="sm" options={[...OBSERVATION_TAGS]} value={field.value} onChange={(v) => field.onChange(Array.isArray(v) ? v : [])} hint={tagHint} />
          )}
        />
      </Panel>
    </>
  );
}
