"use client";
// Feed used: bags or kg, how much, which feed
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Panel } from "@/components/kotila/panel";
import { Segmented } from "@/components/kotila/segmented";
import type { LogFormValues } from "@/components/daily-log/log-form-schema";
import type { FeedType } from "@/hooks/queries/use-feed-types";
import { feedName } from "@/utils/format/feed-name";
import { parseNumber } from "@/utils/parse/parse-number";

export function FeedPanel({ feedTypes }: { feedTypes: FeedType[] }) {
  const { control } = useFormContext<LogFormValues>();
  const unit = useWatch({ control, name: "feedUnit" });
  return (
    <Panel variant="raised" title="Feed used">
      <Controller control={control} name="feedUnit" render={({ field }) => <Segmented options={[{ value: "bags", label: "Bags" }, { value: "kg", label: "Kg" }]} value={field.value} onChange={field.onChange} />} />
      <Controller
        control={control}
        name="feedQty"
        render={({ field, fieldState }) => (
          <TextInput
            label="Feed used"
            optional
            inputMode="decimal"
            suffix={unit}
            defaultValue={field.value?.toString() ?? ""}
            onChange={(t) => field.onChange(parseNumber(t))}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="feedTypeId"
        render={({ field, fieldState }) => (
          <Select
            label="Feed type"
            placeholder={feedTypes.length ? "Choose the feed" : "No feed types yet — add them in Settings"}
            options={feedTypes.map((t) => ({ value: t.id, label: feedName(t) }))}
            value={field.value ?? undefined}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
    </Panel>
  );
}
