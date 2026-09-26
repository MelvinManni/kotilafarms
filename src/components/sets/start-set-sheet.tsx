"use client";
// Start a Set: pen, day-olds, supplier and price; saves the vaccine schedule and the day-olds cost with it
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/kotila/button";
import { ChipGroup } from "@/components/kotila/chip-group";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE, PENS } from "@/constants/farm";
import { useStartSet } from "@/hooks/queries/use-sets";
import { setCreateSchema, type SetCreateInput } from "@/schemas/set";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { naira } from "@/utils/format/naira";
import { parseNumber } from "@/utils/parse/parse-number";

export function StartSetSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const start = useStartSet();
  // One id per open form, so a double tap or retry can't start two Sets
  const [clientId] = useState(() => crypto.randomUUID());
  const form = useForm<SetCreateInput>({
    resolver: zodResolver(setCreateSchema),
    defaultValues: { clientId, pen: "", name: "", startDate: todayInZone(FARM_TIMEZONE), dayOldSupplier: "" },
  });
  const [intake, unit] = useWatch({ control: form.control, name: ["intake", "dayOldUnitCost"] });
  const submit = form.handleSubmit((values) => start.mutate(values, { onSuccess: (set) => router.push(`/sets/${set.id}`) }));
  return (
    <Sheet
      title="Start a new Set"
      description="The vaccine schedule is added from the farm defaults, and the day-olds are saved as this Set's first expense."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={start.isPending}>Start the Set</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {start.error ? <Notice tone="alert" compact>{start.error.message}</Notice> : null}
        <Controller control={form.control} name="pen" render={({ field, fieldState }) => (
          <div className="flex flex-col gap-2">
            <TextInput label="Pen" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
            <ChipGroup multiple={false} size="sm" options={PENS} value={PENS.includes(field.value) ? field.value : null} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} />
          </div>
        )} />
        <Controller control={form.control} name="startDate" render={({ field, fieldState }) => <TextInput label="Day-olds arrived" type="date" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
        <Controller control={form.control} name="intake" render={({ field, fieldState }) => (
          <TextInput label="Day-olds" inputMode="numeric" suffix="birds" value={field.value?.toString() ?? ""} onChange={(t) => field.onChange(parseNumber(t) ?? undefined)} error={fieldState.error?.message} />
        )} />
        <Controller control={form.control} name="dayOldSupplier" render={({ field, fieldState }) => <TextInput label="Supplier" placeholder="Chi Farms" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
        <Controller control={form.control} name="dayOldUnitCost" render={({ field, fieldState }) => (
          <MoneyInput label="Price per day-old" required value={field.value ?? null} onChange={(v) => field.onChange(v ?? undefined)} error={fieldState.error?.message}
            hint={intake && unit ? `${naira(intake * unit)} in all, saved as a Day-old chicks expense` : undefined} />
        )} />
        <Controller control={form.control} name="name" render={({ field }) => <TextInput label="Name" optional placeholder="e.g. Christmas birds" value={field.value ?? ""} onChange={field.onChange} />} />
      </form>
    </Sheet>
  );
}
