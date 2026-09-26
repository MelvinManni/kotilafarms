"use client";
// Manure and droppings sold: which Set, when, how much
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useAddManure } from "@/hooks/queries/use-sales";
import { useSets } from "@/hooks/queries/use-sets";
import { todayInZone } from "@/utils/dates/today-in-zone";

export function ManureSheet({ onClose }: { onClose: () => void }) {
  const sets = useSets();
  const add = useAddManure();
  const [clientId] = useState(() => crypto.randomUUID());
  const [setId, setSetId] = useState("");
  const [date, setDate] = useState(todayInZone(FARM_TIMEZONE));
  const [amount, setAmount] = useState<number | null>(null);
  return (
    <Sheet
      title="Manure sale"
      description="Manure and droppings count as Set revenue."
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!setId || !amount || add.isPending} onClick={() => amount && add.mutate({ clientId, setId, date, amount, kind: "manure" }, { onSuccess: onClose })}>Save manure sale</Button></>}
    >
      {add.error ? <Notice tone="alert" compact>{add.error.message}</Notice> : null}
      <Select label="Set" required placeholder="Choose the Set" options={(sets.data ?? []).map((s) => ({ value: s.id, label: `Set ${s.number}` }))} value={setId || undefined} onChange={setSetId} />
      <TextInput label="Sold on" type="date" value={date} onChange={setDate} />
      <MoneyInput label="Amount" required value={amount} onChange={setAmount} />
    </Sheet>
  );
}
