"use client";
// Add a shareholder to the register with the shares they hold
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { useAddShareholder } from "@/hooks/queries/use-capital";
import { shareholderCreateSchema } from "@/schemas/capital";
import { fieldErrors } from "@/schemas/field-errors";
import { parseNumber } from "@/utils/parse/parse-number";

export function ShareholderSheet({ onClose }: { onClose: () => void }) {
  const add = useAddShareholder();
  const [clientId] = useState(() => crypto.randomUUID());
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = () => {
    const result = shareholderCreateSchema.safeParse({ clientId, name, shares: parseNumber(shares) ?? undefined });
    if (!result.success) return setErrors(fieldErrors(result.error));
    add.mutate(result.data, { onSuccess: onClose });
  };
  return (
    <Sheet title="Add a shareholder" description="As written in the share register." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={save} disabled={add.isPending}>Add shareholder</Button></>}>
      {add.error ? <Notice tone="alert" compact>{add.error.message}</Notice> : null}
      <TextInput label="Name" required value={name} onChange={setName} error={errors.name} />
      <TextInput label="Shares held" required inputMode="numeric" value={shares} onChange={setShares} error={errors.shares} placeholder="e.g. 122,985" />
    </Sheet>
  );
}
