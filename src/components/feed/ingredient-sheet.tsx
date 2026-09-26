"use client";
// Record raw ingredients bought to mix on site: what, how much × cost each = total, which Set it feeds
import { useState } from "react";
import { AttributionField } from "@/components/kotila/attribution-field";
import { Button } from "@/components/kotila/button";
import { Segmented } from "@/components/kotila/segmented";
import { TextInput } from "@/components/kotila/fields/text-input";
import { LinkedAmounts } from "@/components/kotila/linked-amounts";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useAddIngredientPurchase } from "@/hooks/queries/use-feed";
import { useSets } from "@/hooks/queries/use-sets";
import { INGREDIENT_UNITS, ingredientPurchaseCreateSchema } from "@/schemas/feed";
import { fieldErrors } from "@/schemas/field-errors";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { attributionSets } from "@/utils/sets/attribution-sets";

type Amounts = { quantity: number | null; unitPrice: number | null; total: number | null };
type Unit = (typeof INGREDIENT_UNITS)[number];

export function IngredientSheet({ onClose }: { onClose: () => void }) {
  const sets = useSets();
  const add = useAddIngredientPurchase();
  const [clientId] = useState(() => crypto.randomUUID());
  const [ingredient, setIngredient] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [amounts, setAmounts] = useState<Amounts>({ quantity: null, unitPrice: null, total: null });
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(() => todayInZone(FARM_TIMEZONE));
  const [setId, setSetId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const choices = attributionSets(sets.data ?? [], date);

  const save = () => {
    const body = { clientId, date, setId, ingredient, unit, quantity: amounts.quantity ?? undefined, unitCost: amounts.unitPrice ?? undefined, total: amounts.total ?? undefined, supplier: supplier.trim() || null };
    const result = ingredientPurchaseCreateSchema.safeParse(body);
    if (!result.success) return setErrors(fieldErrors(result.error));
    setErrors({});
    add.mutate(result.data, { onSuccess: onClose });
  };

  return (
    <Sheet wide title="Record ingredients" description="Maize, soya, red oil, ginger, garlic — anything bought to mix feed on the farm." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={save} disabled={add.isPending}>{add.isPending ? "Saving…" : "Save ingredients"}</Button></>}>
      {add.error ? <Notice tone="alert" compact>{add.error.message}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Ingredient" required value={ingredient} onChange={setIngredient} placeholder="e.g. Maize" error={errors.ingredient} />
        <Segmented label="Sold by the" options={INGREDIENT_UNITS.map((u) => ({ value: u, label: u }))} value={unit} onChange={(u) => setUnit(u as Unit)} />
      </div>
      <LinkedAmounts quantityLabel="Quantity" quantityUnit={unit} unitLabel={`Cost per ${unit === "litres" ? "litre" : unit.replace(/s$/, "")}`} totalLabel="Total cost" note="Fill any two; the third is worked out." onChange={setAmounts} />
      {errors.quantity ?? errors.unitCost ?? errors.total ? <Notice tone="alert" compact>{errors.quantity ?? errors.unitCost ?? errors.total}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Where from" optional value={supplier} onChange={setSupplier} placeholder="e.g. Ogige market" />
        <TextInput label="Date" type="date" value={date} onChange={setDate} error={errors.date} />
      </div>
      <AttributionField label="Which Set does it feed?" sets={choices} value={setId || undefined} onChange={setSetId} showError={Boolean(errors.setId)} allowOverhead={false} />
    </Sheet>
  );
}
