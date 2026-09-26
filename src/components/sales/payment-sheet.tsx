"use client";
// Record a payment: choose the sale (if not already chosen), how much, when and how
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Segmented } from "@/components/kotila/segmented";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { PAYMENT_METHODS } from "@/constants/payment-methods";
import { useAddPayment } from "@/hooks/queries/use-sales";
import type { PaymentMethod, SaleRow } from "@/types/sale";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

export function PaymentSheet({ owed, sale, onClose }: { owed: SaleRow[]; sale?: SaleRow; onClose: () => void }) {
  const [saleId, setSaleId] = useState(sale?.id ?? owed[0]?.id ?? "");
  const chosen = owed.find((s) => s.id === saleId) ?? sale;
  const [amount, setAmount] = useState<number | null>(chosen?.balance ?? null);
  const [date, setDate] = useState(todayInZone(FARM_TIMEZONE));
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [clientId] = useState(() => crypto.randomUUID());
  const pay = useAddPayment();
  const pick = (id: string) => {
    setSaleId(id);
    setAmount(owed.find((s) => s.id === id)?.balance ?? null);
  };
  const save = () => chosen && amount && pay.mutate({ saleId: chosen.id, clientId, amount, date, method }, { onSuccess: onClose });
  return (
    <Sheet
      title="Record a payment"
      description={chosen ? `${chosen.buyer.name} owes ${naira(chosen.balance)} for ${chosen.birds} birds sold on ${shortDate(chosen.date, false)}.` : "Nothing is owed right now."}
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save} disabled={!chosen || !amount || pay.isPending}>Save payment</Button></>}
    >
      {pay.error ? <Notice tone="alert" compact>{pay.error.message}</Notice> : null}
      {sale ? null : (
        <Select label="Which sale?" options={owed.map((s) => ({ value: s.id, label: `${s.buyer.name} · Set ${s.set.number} · owes ${naira(s.balance)}` }))} value={saleId || undefined} onChange={pick} />
      )}
      <MoneyInput label="Amount paid" required value={amount} onChange={setAmount} hint={chosen && amount && amount < chosen.balance ? `${naira(chosen.balance - amount)} will still be owed` : undefined} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Paid on" type="date" value={date} onChange={setDate} />
        <Segmented label="How" options={[...PAYMENT_METHODS]} value={method} onChange={(m) => setMethod(m as PaymentMethod)} />
      </div>
    </Sheet>
  );
}
