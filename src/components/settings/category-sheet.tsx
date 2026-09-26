"use client";
// Add or rename an expense category, and say whether it can hold capital items
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { Checkbox } from "@/components/kotila/fields/checkbox";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { useSaveCategory } from "@/hooks/queries/use-category-changes";
import type { ExpenseCategory } from "@/types/expense";

export function CategorySheet({ category, onClose }: { category?: ExpenseCategory; onClose: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [capital, setCapital] = useState(category?.isCapitalEligible ?? false);
  const save = useSaveCategory();
  return (
    <Sheet
      title={category ? "Change category" : "Add a category"}
      description="Renaming keeps every expense already in it."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={name.trim().length < 2 || save.isPending} onClick={() => save.mutate({ id: category?.id, name: name.trim(), isCapitalEligible: capital }, { onSuccess: onClose })}>
            {category ? "Save category" : "Add category"}
          </Button>
        </>
      }
    >
      {save.error ? <Notice tone="alert" compact>{save.error.message}</Notice> : null}
      <TextInput label="Name" value={name} onChange={setName} placeholder="Fuel and power" />
      <Checkbox label="Can hold capital items (things that last more than one Set)" checked={capital} onChange={setCapital} />
    </Sheet>
  );
}
