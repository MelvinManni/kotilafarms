"use client";
// New sale: Set, date, buyer, birds × price = total, paid now and still owed, method, deposit
import { useState } from "react";
import { BuyerPicker } from "@/components/sales/buyer-picker";
import { checkSale, NEW_BUYER, type SaleFormState } from "@/components/sales/sale-form-state";
import { Button } from "@/components/kotila/button";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { LinkedAmounts } from "@/components/kotila/linked-amounts";
import { Notice } from "@/components/kotila/notice";
import { Segmented } from "@/components/kotila/segmented";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { PAYMENT_METHODS } from "@/constants/payment-methods";
import { useAddBuyer, useAddSale, useBuyers } from "@/hooks/queries/use-sales";
import { useSets } from "@/hooks/queries/use-sets";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { naira } from "@/utils/format/naira";
import { saleBalance } from "@/utils/metrics/money";

export function NewSaleSheet({ onClose, bulkRate }: { onClose: () => void; bulkRate: number | null }) {
  const sets = useSets();
  const buyers = useBuyers();
  const addSale = useAddSale();
  const addBuyer = useAddBuyer();
  // Ids fixed per open form, so a retry can't record the sale (or the new buyer) twice
  const [ids] = useState(() => ({ sale: crypto.randomUUID(), buyer: crypto.randomUUID() }));
  const [form, setForm] = useState<SaleFormState>({ setId: "", date: todayInZone(FARM_TIMEZONE), buyerId: "", newBuyer: { name: "", phone: "" }, birds: null, pricePerBird: null, total: null, paidAtSale: null, deposit: null, method: "cash" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (patch: Partial<SaleFormState>) => setForm((f) => ({ ...f, ...patch }));
  const chosenSet = sets.data?.find((s) => s.id === form.setId);
  const owed = form.total === null ? null : Math.max(0, saleBalance({ total: form.total, deposit: form.deposit ?? 0, paidAtSale: form.paidAtSale ?? 0 }, []));
  const pending = addSale.isPending || addBuyer.isPending;

  const save = async () => {
    const newBuyer = form.buyerId === NEW_BUYER;
    if (newBuyer && form.newBuyer.name.trim().length < 2) return setErrors({ buyerId: "Enter the new buyer's name." });
    const check = checkSale(form, ids.sale, newBuyer ? crypto.randomUUID() : form.buyerId);
    if (!check.body) return setErrors(check.errors);
    setErrors({});
    const buyerId = newBuyer ? (await addBuyer.mutateAsync({ clientId: ids.buyer, name: form.newBuyer.name.trim(), phone: form.newBuyer.phone.trim() || null })).id : form.buyerId;
    addSale.mutate({ ...check.body, buyerId }, { onSuccess: onClose });
  };

  return (
    <Sheet wide title="New sale" description="Record every sale with what was paid and what is still owed." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={save} disabled={pending || !sets.data || !buyers.data}>{pending ? "Saving…" : "Save sale"}</Button></>}>
      {addSale.error ?? addBuyer.error ? <Notice tone="alert" compact>{(addSale.error ?? addBuyer.error)!.message}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Set" required placeholder="Choose the Set" options={(sets.data ?? []).map((s) => ({ value: s.id, label: s.status === "closed" ? `Set ${s.number} · closed ${s.closedOn}` : `Set ${s.number} · ${s.status}, day ${s.dayOfAge}` }))} value={form.setId || undefined} onChange={(setId) => set({ setId })} error={errors.setId} hint={chosenSet ? `${chosenSet.liveBirds} live birds on the books` : undefined} />
        <TextInput label="Date of sale" type="date" value={form.date} onChange={(date) => set({ date })} error={errors.date} />
      </div>
      {chosenSet?.status === "closed" ? <Notice tone="warning" compact title={`You're adding a sale to Set ${chosenSet.number} after it closed.`}>Its profit will be worked out again.</Notice> : null}
      <BuyerPicker buyers={buyers.data ?? []} value={form.buyerId} onChange={(buyerId) => set({ buyerId })} newBuyer={form.newBuyer} onNewBuyer={(newBuyer) => set({ newBuyer })} error={errors.buyerId} />
      <LinkedAmounts quantityLabel="Birds" quantityUnit="birds" unitLabel="Price per bird" totalLabel="Sale total"
        note={`Fill any two.${bulkRate ? ` Bulk rate is ${naira(bulkRate)} a bird.` : ""}`}
        onChange={(v) => set({ birds: v.quantity, pricePerBird: v.unitPrice, total: v.total })} />
      {errors.birds ?? errors.total ?? errors.pricePerBird ? <Notice tone="alert" compact>{errors.birds ?? errors.total ?? errors.pricePerBird}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Paid now" required value={form.paidAtSale} onChange={(paidAtSale) => set({ paidAtSale })} error={errors.paidAtSale} />
        <MoneyInput label="Still owed" value={owed} calculated readOnly hint="Sale total less what is paid" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Segmented label="Payment method" options={[...PAYMENT_METHODS]} value={form.method} onChange={(m) => set({ method: m as SaleFormState["method"] })} />
        <MoneyInput label="Deposit taken earlier" value={form.deposit} onChange={(deposit) => set({ deposit })} hint="Optional · leave empty if none" />
      </div>
    </Sheet>
  );
}
