"use client";
// Record money a shareholder puts in or takes out (removed shareholders: taken out only); changes their money in the company, not their shares
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Segmented } from "@/components/kotila/segmented";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useAddCapitalEntry } from "@/hooks/queries/use-capital";
import { capitalEntryCreateSchema } from "@/schemas/capital";
import { fieldErrors } from "@/schemas/field-errors";
import type { ShareholderRow } from "@/types/capital";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { naira } from "@/utils/format/naira";

const IN_OUT = [{ value: "contributed", label: "Put in" }, { value: "withdrawn", label: "Taken out" }];

type Props = { shareholders: ShareholderRow[]; removed: ShareholderRow[]; initialKind?: "contributed" | "withdrawn"; onClose: () => void };

export function ContributionSheet({ shareholders, removed, initialKind = "contributed", onClose }: Props) {
  const add = useAddCapitalEntry();
  const [clientId] = useState(() => crypto.randomUUID());
  const [shareholderId, setShareholderId] = useState("");
  const [kind, setKind] = useState<string>(initialKind);
  const [amount, setAmount] = useState<number | null>(null);
  const [date, setDate] = useState(() => todayInZone(FARM_TIMEZONE));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const leaver = removed.find((s) => s.id === shareholderId);
  const choose = (id: string) => {
    setShareholderId(id);
    if (removed.some((s) => s.id === id)) setKind("withdrawn");
  };
  const options = [...shareholders.map((s) => ({ value: s.id, label: s.name })), ...removed.map((s) => ({ value: s.id, label: `${s.name} (removed)` }))];
  const withdrawal = kind === "withdrawn";
  const save = () => {
    const result = capitalEntryCreateSchema.safeParse({ clientId, shareholderId, kind, amount: amount ?? undefined, date, note: note.trim() || null });
    if (!result.success) return setErrors(fieldErrors(result.error));
    add.mutate(result.data, { onSuccess: onClose });
  };
  return (
    <Sheet title={withdrawal ? "Record a withdrawal" : "Record a contribution"} description="Money a shareholder puts into the company, or takes out. Removed shareholders can only be paid out." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={save} disabled={add.isPending}>Save</Button></>}>
      {add.error ? <Notice tone="alert" compact>{add.error.message}</Notice> : null}
      <Select label="Shareholder" required placeholder="Choose who" options={options} value={shareholderId || undefined} onChange={choose} error={errors.shareholderId} />
      {leaver ? (
        <Notice compact>{leaver.name} was removed from the register, so only money taken out can be recorded. Their net position is {naira(leaver.net)}.</Notice>
      ) : (
        <Segmented label="Money" options={IN_OUT} value={kind} onChange={setKind} />
      )}
      <MoneyInput label="Amount" required value={amount} onChange={setAmount} error={errors.amount} />
      <TextInput label="Date" type="date" value={date} onChange={setDate} error={errors.date} />
      <TextInput label="Note" optional value={note} onChange={setNote} />
    </Sheet>
  );
}
