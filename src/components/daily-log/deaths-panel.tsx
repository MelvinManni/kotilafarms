"use client";
// Deaths first: big stepper, live count as it changes, optional cause
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ChipGroup } from "@/components/kotila/chip-group";
import { Panel } from "@/components/kotila/panel";
import { Stepper } from "@/components/kotila/stepper";
import { DEATH_CAUSES } from "@/constants/death-causes";
import type { LogFormValues } from "@/components/daily-log/log-form-schema";
import { count } from "@/utils/format/count";

type DeathsPanelProps = { liveBefore: number; isToday: boolean; yesterday: number | null; alertAbove: number };

export function DeathsPanel({ liveBefore, isToday, yesterday, alertAbove }: DeathsPanelProps) {
  const { control } = useFormContext<LogFormValues>();
  const deaths = useWatch({ control, name: "deaths" });
  return (
    <Panel variant="raised" title="Deaths">
      <Controller
        control={control}
        name="deaths"
        render={({ field }) => (
          <Stepper
            label={isToday ? "Deaths today" : "Deaths that day"}
            value={field.value}
            onChange={field.onChange}
            unit="birds"
            alertAbove={alertAbove}
            hint={yesterday === null ? undefined : `Day before: ${yesterday}`}
          />
        )}
      />
      <p aria-live="polite" className="m-0 text-body-lg font-semibold text-ink tabular-nums">
        {count(liveBefore - deaths)} live {isToday ? "after today" : "now"} <span className="font-medium text-ink-muted">(was {count(liveBefore)})</span>
      </p>
      <Controller
        control={control}
        name="deathCause"
        render={({ field }) => (
          <ChipGroup
            label="Cause"
            optional
            multiple={false}
            size="sm"
            options={[...DEATH_CAUSES]}
            value={field.value}
            onChange={(v) => field.onChange(typeof v === "string" ? v : null)}
            hint="Leave blank if you're not sure — a guess is worse than nothing"
          />
        )}
      />
    </Panel>
  );
}
