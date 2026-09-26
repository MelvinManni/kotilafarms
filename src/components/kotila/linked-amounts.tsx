"use client";
// Quantity, price each, total: fill any two and the third is worked out; none can be blank
import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/kotila/fields/field";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { affixClasses, calculatedPillClasses, inputClasses } from "@/components/kotila/fields/input-classes";
import {
  calculatedField,
  initialLinkedAmounts,
  solveLinkedAmounts,
  type LinkedField,
} from "@/utils/linked-amounts/solve-linked-amounts";
import { parseNumber } from "@/utils/parse/parse-number";
import { cn } from "@/utils/cn";

type LinkedAmountsProps = {
  quantityLabel?: string;
  quantityUnit?: string;
  unitLabel?: string;
  totalLabel?: string;
  defaultQuantity?: number;
  defaultUnitPrice?: number;
  defaultTotal?: number;
  stacked?: boolean;
  note?: string;
  onChange?: (value: { quantity: number | null; unitPrice: number | null; total: number | null }) => void;
};

export function LinkedAmounts(props: LinkedAmountsProps) {
  const quantityId = useId();
  const [state, setState] = useState(() =>
    initialLinkedAmounts(props.defaultQuantity, props.defaultUnitPrice, props.defaultTotal),
  );
  // Keep what was typed so "12." survives while typing a half bag
  const [quantityText, setQuantityText] = useState(props.defaultQuantity?.toString() ?? "");
  const calc = calculatedField(state);
  const update = (field: LinkedField, value: number | null) => {
    const next = solveLinkedAmounts(state, field, value);
    setState(next);
    props.onChange?.({ quantity: next.quantity, unitPrice: next.unitPrice, total: next.total });
  };
  return (
    <div className={cn("grid items-start gap-3", props.stacked ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3")}>
      <Field label={props.quantityLabel ?? "Quantity"} required htmlFor={quantityId}>
        <div className="relative flex items-center">
          <Input
            id={quantityId}
            inputMode="decimal"
            required
            value={calc === "quantity" ? (state.quantity?.toString() ?? "") : quantityText}
            onChange={(e) => {
              setQuantityText(e.target.value);
              update("quantity", parseNumber(e.target.value));
            }}
            className={cn(inputClasses, "pr-14", calc === "quantity" && "pr-28")}
          />
          {calc === "quantity" ? (
            <span className={calculatedPillClasses}>calculated</span>
          ) : props.quantityUnit ? (
            <span className={cn(affixClasses, "right-4")}>{props.quantityUnit}</span>
          ) : null}
        </div>
      </Field>
      <MoneyInput label={props.unitLabel ?? "Price each"} required value={state.unitPrice} calculated={calc === "unitPrice"} onChange={(v) => update("unitPrice", v)} />
      <MoneyInput label={props.totalLabel ?? "Total"} required value={state.total} calculated={calc === "total"} onChange={(v) => update("total", v)} />
      <p className="col-span-full text-caption font-medium text-ink-muted">
        {props.note ?? "Fill any two. The third is worked out, so none can be left blank."}
      </p>
    </div>
  );
}
