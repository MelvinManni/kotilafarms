"use client";
// Add a feed or change one: starter, grower or finisher, the brand, and the bag size; retire it when no longer bought
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { Checkbox } from "@/components/kotila/fields/checkbox";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Segmented } from "@/components/kotila/segmented";
import { Sheet } from "@/components/kotila/sheet";
import { useSaveFeedType, type FeedType } from "@/hooks/queries/use-feed-types";
import { feedTypeCreateSchema } from "@/schemas/feed";
import { fieldErrors } from "@/schemas/field-errors";
import { parseNumber } from "@/utils/parse/parse-number";

const KINDS = [{ value: "starter", label: "Starter" }, { value: "grower", label: "Grower" }, { value: "finisher", label: "Finisher" }];

export function FeedTypeSheet({ feed, onClose }: { feed?: FeedType; onClose: () => void }) {
  const [kind, setKind] = useState<string>(feed?.kind ?? "starter");
  const [brand, setBrand] = useState(feed?.brand ?? "");
  const [kg, setKg] = useState(String(feed?.kgPerBag ?? 25));
  const [active, setActive] = useState(feed?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useSaveFeedType();

  const submit = () => {
    const result = feedTypeCreateSchema.safeParse({ kind, brand, kgPerBag: parseNumber(kg) ?? undefined });
    if (!result.success) return setErrors(fieldErrors(result.error));
    save.mutate({ id: feed?.id, ...result.data, ...(feed ? { active } : {}) }, { onSuccess: onClose });
  };

  return (
    <Sheet title={feed ? "Change feed" : "Add a feed"} description="Feeds you buy show in feed purchases and the daily log." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={save.isPending} onClick={submit}>{feed ? "Save feed" : "Add feed"}</Button></>}>
      {save.error ? <Notice tone="alert" compact>{save.error.message}</Notice> : null}
      <Segmented label="Stage" options={KINDS} value={kind} onChange={setKind} />
      <TextInput label="Brand" required value={brand} onChange={setBrand} placeholder="e.g. Ultima" error={errors.brand} />
      <TextInput label="Weight per bag" suffix="kg" inputMode="decimal" value={kg} onChange={setKg} error={errors.kgPerBag} />
      {feed ? <Checkbox label="Still bought (untick to take it off the lists; old records keep it)" checked={active} onChange={setActive} /> : null}
    </Sheet>
  );
}
