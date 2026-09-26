"use client";
// The expense form's fields: amount, category, what for, Set or overhead, date, capital item, receipt, reason
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ReceiptPicker } from "@/components/expenses/receipt-picker";
import { AttributionField } from "@/components/kotila/attribution-field";
import { Checkbox } from "@/components/kotila/fields/checkbox";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import type { ExpenseFormValues } from "@/components/expenses/expense-form-schema";
import type { ExpenseCategory } from "@/types/expense";

type ExpenseFieldsProps = { categories: ExpenseCategory[]; sets: { id: string; label: string; meta?: string }[]; askReason: boolean; showAttributionError: boolean };

export function ExpenseFields({ categories, sets, askReason, showAttributionError }: ExpenseFieldsProps) {
  const { control } = useFormContext<ExpenseFormValues>();
  const categoryId = useWatch({ control, name: "categoryId" });
  const capitalAllowed = categories.find((c) => c.id === categoryId)?.isCapitalEligible;
  return (
    <>
      <Controller control={control} name="amount" render={({ field, fieldState }) => <MoneyInput label="Amount" required value={field.value ?? null} onChange={(v) => field.onChange(v ?? undefined)} error={fieldState.error?.message} />} />
      <Controller
        control={control}
        name="categoryId"
        render={({ field, fieldState }) => (
          <Select label="Category" required placeholder="Choose a category" options={categories.map((c) => ({ value: c.id, label: c.name }))} value={field.value || undefined} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <Controller control={control} name="description" render={({ field, fieldState }) => <TextInput label="What for" placeholder="12 bags of sawdust for Set 4" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      <Controller control={control} name="attribution" render={({ field }) => <AttributionField sets={sets} value={field.value || undefined} onChange={field.onChange} showError={showAttributionError} />} />
      <Controller control={control} name="date" render={({ field, fieldState }) => <TextInput label="Paid on" type="date" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      {capitalAllowed ? (
        <Controller control={control} name="capitalItem" render={({ field }) => <Checkbox label="Capital item — lasts more than one Set, kept apart from running costs" checked={field.value} onChange={field.onChange} />} />
      ) : null}
      <Controller control={control} name="receiptKey" render={({ field }) => <ReceiptPicker value={field.value} onChange={field.onChange} />} />
      {askReason ? (
        <Controller control={control} name="reason" render={({ field, fieldState }) => <TextInput label="Why are you changing the amount?" required multiline value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
      ) : null}
    </>
  );
}
