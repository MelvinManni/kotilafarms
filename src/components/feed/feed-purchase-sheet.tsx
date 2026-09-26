"use client";
// Record a feed purchase: feed, bags × price per bag = total (none blank), bag size, transport as its own line, supplier, date, Set or store
import { useState } from "react";
import { AttributionField } from "@/components/kotila/attribution-field";
import { Button } from "@/components/kotila/button";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Select } from "@/components/kotila/fields/select";
import { TextInput } from "@/components/kotila/fields/text-input";
import { LinkedAmounts } from "@/components/kotila/linked-amounts";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useAddFeedPurchase } from "@/hooks/queries/use-feed";
import { useFeedTypes } from "@/hooks/queries/use-feed-types";
import { useSets } from "@/hooks/queries/use-sets";
import { feedPurchaseCreateSchema } from "@/schemas/feed";
import { fieldErrors } from "@/schemas/field-errors";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { feedName } from "@/utils/format/feed-name";
import { parseNumber } from "@/utils/parse/parse-number";
import { attributionSets } from "@/utils/sets/attribution-sets";

type Amounts = { quantity: number | null; unitPrice: number | null; total: number | null };

export function FeedPurchaseSheet({ onClose }: { onClose: () => void }) {
  const types = useFeedTypes();
  const sets = useSets();
  const add = useAddFeedPurchase();
  // Fixed per open form, so a double tap or retry records it once
  const [clientId] = useState(() => crypto.randomUUID());
  const [feedTypeId, setFeedTypeId] = useState("");
  const [amounts, setAmounts] = useState<Amounts>({ quantity: null, unitPrice: null, total: null });
  const [kgPerBag, setKgPerBag] = useState("");
  const [transport, setTransport] = useState<number | null>(null);
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(() => todayInZone(FARM_TIMEZONE));
  const [attribution, setAttribution] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const chosen = types.data?.find((t) => t.id === feedTypeId);

  const save = () => {
    const body = {
      clientId, date, feedTypeId, supplier,
      bags: amounts.quantity ?? undefined, pricePerBag: amounts.unitPrice ?? undefined, total: amounts.total ?? undefined,
      kgPerBag: parseNumber(kgPerBag) ?? chosen?.kgPerBag, transportCost: transport ?? 0,
      setId: attribution && attribution !== "overhead" ? attribution : null, overhead: attribution === "overhead",
    };
    const result = feedPurchaseCreateSchema.safeParse(body);
    if (!result.success) return setErrors(fieldErrors(result.error));
    setErrors({});
    add.mutate(result.data, { onSuccess: onClose });
  };

  return (
    <Sheet wide title="Record a feed purchase" description="Every purchase needs bags, price per bag and total." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={save} disabled={add.isPending || !types.data}>{add.isPending ? "Saving…" : "Save purchase"}</Button></>}>
      {add.error ? <Notice tone="alert" compact>{add.error.message}</Notice> : null}
      {types.data?.length === 0 ? <Notice tone="warning" compact action={{ label: "Add a feed", href: "/settings/feed" }}>No feeds are set up yet. Add the feeds you buy in Settings first.</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Feed" required placeholder="Choose the feed" options={(types.data ?? []).map((t) => ({ value: t.id, label: feedName(t) }))} value={feedTypeId || undefined} onChange={setFeedTypeId} error={errors.feedTypeId} />
        <TextInput label="Weight per bag" suffix="kg" inputMode="decimal" value={kgPerBag} placeholder={chosen ? String(chosen.kgPerBag) : "25"} onChange={setKgPerBag} error={errors.kgPerBag} hint="Leave empty for the usual bag size" />
      </div>
      <LinkedAmounts quantityLabel="Bags" quantityUnit="bags" unitLabel="Price per bag" totalLabel="Total cost" note="Fill any two; the third is worked out." onChange={setAmounts} />
      {errors.bags ?? errors.pricePerBag ?? errors.total ? <Notice tone="alert" compact>{errors.bags ?? errors.pricePerBag ?? errors.total}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyInput label="Transport (separate line)" value={transport} onChange={setTransport} hint="Optional · saved as its own Transport expense" />
        <TextInput label="Supplier" required value={supplier} onChange={setSupplier} error={errors.supplier} />
      </div>
      <TextInput label="Date" type="date" value={date} onChange={setDate} error={errors.date} />
      <AttributionField label="Which Set will eat this?" sets={attributionSets(sets.data ?? [], date)} value={attribution || undefined} onChange={setAttribution} showError={Boolean(errors.setId)} overheadHint="The store, for any Set" />
    </Sheet>
  );
}
