"use client";
// Add a shareholder to the register, or fix a name or share count (with a reason, kept in the history)
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { useAddShareholder, useUpdateShareholder } from "@/hooks/queries/use-capital";
import { shareholderCreateSchema, shareholderUpdateSchema } from "@/schemas/capital";
import { fieldErrors } from "@/schemas/field-errors";
import type { ShareholderRow } from "@/types/capital";
import { parseNumber } from "@/utils/parse/parse-number";

export function ShareholderSheet({ shareholder, onClose }: { shareholder?: ShareholderRow; onClose: () => void }) {
  const add = useAddShareholder();
  const update = useUpdateShareholder();
  const [clientId] = useState(() => crypto.randomUUID());
  const [name, setName] = useState(shareholder?.name ?? "");
  const [shares, setShares] = useState(shareholder ? String(shareholder.shares) : "");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const failed = add.error ?? update.error;

  const save = () => {
    const count = parseNumber(shares) ?? undefined;
    if (!shareholder) {
      const result = shareholderCreateSchema.safeParse({ clientId, name, shares: count });
      if (!result.success) return setErrors(fieldErrors(result.error));
      return add.mutate(result.data, { onSuccess: onClose });
    }
    const result = shareholderUpdateSchema.safeParse({ name, shares: count, baseVersion: shareholder.version, reason });
    if (!result.success) return setErrors(fieldErrors(result.error));
    update.mutate({ id: shareholder.id, ...result.data }, { onSuccess: onClose });
  };

  return (
    <Sheet title={shareholder ? `Change ${shareholder.name}` : "Add a shareholder"} description={shareholder ? "Correct the register. The old value and your reason are kept in the history." : "As written in the share register."} onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={save} disabled={add.isPending || update.isPending}>{shareholder ? "Save changes" : "Add shareholder"}</Button></>}>
      {failed ? <Notice tone="alert" compact>{failed.message}</Notice> : null}
      <TextInput label="Name" required value={name} onChange={setName} error={errors.name} />
      <TextInput label="Shares held" required inputMode="numeric" value={shares} onChange={setShares} error={errors.shares} placeholder="e.g. 122,985" />
      {shareholder ? <TextInput label="Why it changed" required value={reason} onChange={setReason} error={errors.reason} placeholder="e.g. Shares transferred from Emeka, 1 Oct" /> : null}
    </Sheet>
  );
}
