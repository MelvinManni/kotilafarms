"use client";
// Record a shareholder loan: who lent it, how much, and when it came in
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useAddLoan } from "@/hooks/queries/use-capital";
import { loanCreateSchema } from "@/schemas/capital";
import { fieldErrors } from "@/schemas/field-errors";
import type { CapitalPayload } from "@/types/capital";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { naira } from "@/utils/format/naira";

export function LoanSheet({ c, onClose }: { c: CapitalPayload; onClose: () => void }) {
  const add = useAddLoan();
  const [clientId] = useState(() => crypto.randomUUID());
  const [lender, setLender] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [date, setDate] = useState(() => todayInZone(FARM_TIMEZONE));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const over = amount !== null && amount > c.capacity.headroom;
  const save = () => {
    const result = loanCreateSchema.safeParse({ clientId, lenderShareholderId: lender, amount: amount ?? undefined, advancedOn: date });
    if (!result.success) return setErrors(fieldErrors(result.error));
    add.mutate(result.data, { onSuccess: onClose });
  };
  return (
    <Sheet title="Record a loan" description="Money a shareholder lends beyond their capital, repaid at 16% a year simple interest." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={save} disabled={add.isPending}>Save loan</Button></>}>
      {add.error ? <Notice tone="alert" compact>{add.error.message}</Notice> : null}
      <Select label="Lender" required placeholder="Choose who lent it" options={c.shareholders.map((s) => ({ value: s.id, label: s.name }))} value={lender || undefined} onChange={setLender} error={errors.lenderShareholderId} />
      <MoneyInput label="Amount lent" required value={amount} onChange={setAmount} error={errors.amount} hint={`Room left before the cap: ${naira(Math.max(0, c.capacity.headroom))}`} />
      {over ? <Notice tone="warning" compact>This takes loans past the agreed cap of {naira(c.capacity.cap)}. The shareholders should agree it first.</Notice> : null}
      <TextInput label="Money came in on" type="date" value={date} onChange={setDate} error={errors.advancedOn} />
    </Sheet>
  );
}
