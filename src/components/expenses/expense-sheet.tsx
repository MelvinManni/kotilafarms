"use client";
// Add an expense, or change one: the same form in a sheet (bottom sheet on phones)
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { attributionSets } from "@/components/expenses/attribution-options";
import { ExpenseFields } from "@/components/expenses/expense-fields";
import { attributionToApi, expenseFormSchema, type ExpenseFormValues } from "@/components/expenses/expense-form-schema";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useAddExpense, useCategories, useEditExpense } from "@/hooks/queries/use-expenses";
import { useSets } from "@/hooks/queries/use-sets";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ExpenseRow } from "@/types/expense";
import { todayInZone } from "@/utils/dates/today-in-zone";

type ExpenseSheetProps = { expense?: ExpenseRow; presetSet?: string; onClose: () => void; onSaved?: (row: ExpenseRow) => void; extraActions?: React.ReactNode };

export function ExpenseSheet({ expense, presetSet, onClose, onSaved, extraActions }: ExpenseSheetProps) {
  const phone = useMediaQuery("(max-width: 1023px)");
  const categories = useCategories();
  const sets = useSets();
  const add = useAddExpense();
  const edit = useEditExpense();
  const today = todayInZone(FARM_TIMEZONE);
  // One id per open form, so a double tap or a retry can't add it twice
  const [clientId] = useState(() => crypto.randomUUID());
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense
      ? { amount: expense.amount, categoryId: expense.category.id, description: expense.description, attribution: expense.overhead ? "overhead" : (expense.setId ?? ""), date: expense.date, capitalItem: expense.capitalItem, receiptKey: expense.receiptKey, reason: "" }
      : { categoryId: "", description: "", attribution: presetSet ?? "", date: today, capitalItem: false, receiptKey: null, reason: "" },
  });
  const [date, amount] = useWatch({ control: form.control, name: ["date", "amount"] });
  const askReason = Boolean(expense && expense.date < today && amount !== expense.amount);
  const pending = add.isPending || edit.isPending;
  const error = add.error ?? edit.error;

  const submit = form.handleSubmit(({ attribution, reason, capitalItem, ...values }) => {
    if (askReason && !reason.trim()) return form.setError("reason", { message: "Say why you're changing the amount after the day." });
    const capital = Boolean(categories.data?.find((c) => c.id === values.categoryId)?.isCapitalEligible && capitalItem);
    const body = { ...values, ...attributionToApi(attribution), capitalItem: capital };
    const done = (row: ExpenseRow) => {
      onSaved?.(row);
      onClose();
    };
    if (expense) edit.mutate({ id: expense.id, ...body, baseVersion: expense.version, reason: reason.trim() || undefined }, { onSuccess: done });
    else add.mutate({ clientId, ...body }, { onSuccess: done });
  });

  return (
    <Sheet
      variant={phone ? "sheet" : "modal"}
      title={expense ? "Change expense" : "Add an expense"}
      description="Saved to the farm records with your name."
      onClose={onClose}
      footer={
        <>
          {extraActions}
          <Button variant="primary" size="lg" onClick={submit} disabled={pending || !categories.data || !sets.data}>
            {pending ? "Saving…" : expense ? "Save changes" : "Save expense"}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {error ? <Notice tone="alert" compact>{error.message}</Notice> : null}
          {categories.data && sets.data ? (
            <ExpenseFields categories={categories.data} sets={attributionSets(sets.data, date)} askReason={askReason} showAttributionError={Boolean(form.formState.errors.attribution)} />
          ) : (
            <p className="m-0 text-body text-ink-muted">Loading…</p>
          )}
        </form>
      </FormProvider>
    </Sheet>
  );
}
