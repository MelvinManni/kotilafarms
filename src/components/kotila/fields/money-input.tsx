"use client";
// Naira input: ₦ prefix, thousands separators as you type, whole naira only
import { useId, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/kotila/fields/field";
import { affixClasses, calculatedPillClasses, inputClasses } from "@/components/kotila/fields/input-classes";
import { useControlled } from "@/hooks/use-controlled";
import { count } from "@/utils/format/count";
import { parseNumber } from "@/utils/parse/parse-number";
import { cn } from "@/utils/cn";

type MoneyInputProps = {
  label?: string;
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  calculated?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  aside?: ReactNode;
};

export function MoneyInput({ label, value, defaultValue, onChange, hint, error, required, calculated, readOnly, placeholder = "0", aside }: MoneyInputProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const [current, setCurrent] = useControlled<number | null>(value, defaultValue ?? null, onChange);
  const shown = current === null ? "" : count(current);
  const onType = (text: string) => {
    const n = parseNumber(text);
    setCurrent(n === null ? null : Math.round(Math.abs(n)));
  };
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} messageId={messageId} aside={aside}>
      <div className="relative flex items-center">
        <span className={cn(affixClasses, "left-4")}>₦</span>
        <Input
          id={id}
          inputMode="numeric"
          value={shown}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          onChange={(e) => onType(e.target.value)}
          className={cn(inputClasses, "pl-9.5", calculated && "pr-28")}
        />
        {calculated ? <span className={calculatedPillClasses}>calculated</span> : null}
      </div>
    </Field>
  );
}
