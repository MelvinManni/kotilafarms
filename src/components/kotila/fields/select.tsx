"use client";
// Dropdown inside a Field; options are text or value + label
import { useId } from "react";
import { Select as SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/kotila/fields/field";
import { inputClasses } from "@/components/kotila/fields/input-classes";
import { toOption, type Option } from "@/types/option";
import { cn } from "@/utils/cn";

type SelectProps = {
  label?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
};

export function Select({ label, options, value, defaultValue, placeholder, onChange, hint, error, required, optional }: SelectProps) {
  const labelId = useId();
  const messageId = `${labelId}-message`;
  const items = options.map(toOption);
  return (
    <Field label={label} hint={hint} error={error} required={required} optional={optional} labelId={labelId} messageId={messageId}>
      <SelectRoot
        items={items}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onChange?.(String(next ?? ""))}
      >
        <SelectTrigger
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(inputClasses, "w-full justify-between pr-3.5 text-left data-placeholder:text-ink-faint [&_svg:not([class*='size-'])]:size-5")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-md border border-line bg-surface p-1 shadow-raise">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="min-h-11 rounded-sm px-3 text-[15px] font-medium text-ink focus:bg-green-50 focus:text-green-800">
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </Field>
  );
}
