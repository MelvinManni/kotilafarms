"use client";
// Temperature, a note, and a reason when a past day's count changes
import { Controller, useFormContext } from "react-hook-form";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Panel } from "@/components/kotila/panel";
import type { LogFormValues } from "@/components/daily-log/log-form-schema";
import { parseNumber } from "@/utils/parse/parse-number";

export function NotesPanel({ brooding, askReason }: { brooding: boolean; askReason: boolean }) {
  const { control } = useFormContext<LogFormValues>();
  return (
    <Panel variant="raised" title="Temperature and notes">
      <Controller
        control={control}
        name="tempC"
        render={({ field, fieldState }) => (
          <TextInput
            label="Temperature in the pen"
            optional
            suffix="°C"
            inputMode="decimal"
            placeholder="31"
            defaultValue={field.value?.toString() ?? ""}
            onChange={(t) => field.onChange(parseNumber(t))}
            error={fieldState.error?.message}
            hint={brooding ? "Matters most while brooding (first 14 days)." : undefined}
          />
        )}
      />
      <Controller
        control={control}
        name="note"
        render={({ field }) => <TextInput label="Note" optional multiline placeholder="Anything the manager should know — where the deaths were, what you changed" value={field.value} onChange={field.onChange} />}
      />
      {askReason ? (
        <Controller
          control={control}
          name="reason"
          render={({ field, fieldState }) => (
            <TextInput label="Why are you changing this?" required multiline value={field.value} onChange={field.onChange} error={fieldState.error?.message} hint="Changing a count after the day needs a reason. The old value is kept." />
          )}
        />
      ) : null}
    </Panel>
  );
}
