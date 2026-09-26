"use client";
// Owners remove an expense with a reason; it stays in the history
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { useRemoveExpense } from "@/hooks/queries/use-expenses";
import type { ExpenseRow } from "@/types/expense";
import { naira } from "@/utils/format/naira";

export function RemoveExpenseSheet({ expense, onClose }: { expense: ExpenseRow; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const remove = useRemoveExpense();
  return (
    <Sheet
      title="Remove this expense?"
      description={`${expense.description} · ${naira(expense.amount)}. It leaves every total but stays in the edit history.`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Keep it</Button>
          <Button variant="danger" disabled={reason.trim().length < 3 || remove.isPending} onClick={() => remove.mutate({ id: expense.id, reason }, { onSuccess: onClose })}>
            Remove expense
          </Button>
        </>
      }
    >
      {remove.error ? <Notice tone="alert" compact>{remove.error.message}</Notice> : null}
      <TextInput label="Why is it being removed?" required value={reason} onChange={setReason} placeholder="Entered twice" />
    </Sheet>
  );
}
