"use client";
// Text input (or multi-line) inside a Field, with an optional unit suffix
import { useId, type HTMLAttributes, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/kotila/fields/field";
import { affixClasses, inputClasses } from "@/components/kotila/fields/input-classes";
import { cn } from "@/utils/cn";

type TextInputProps = {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  suffix?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  name?: string;
  aside?: ReactNode;
};

export function TextInput({ label, hint, error, required, optional, multiline, suffix, onChange, aside, type = "text", ...rest }: TextInputProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const shared = {
    id,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error || hint ? messageId : undefined,
    ...rest,
  };
  const control = multiline ? (
    <textarea
      {...shared}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={cn(inputClasses, "min-h-26 resize-y py-3.5 leading-normal outline-none")}
    />
  ) : (
    <Input
      {...shared}
      type={type}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={cn(inputClasses, suffix && "pr-14")}
    />
  );
  return (
    <Field label={label} hint={hint} error={error} required={required} optional={optional} htmlFor={id} messageId={messageId} aside={aside}>
      {suffix ? (
        <div className="relative flex items-center">
          {control}
          <span className={cn(affixClasses, "right-4")}>{suffix}</span>
        </div>
      ) : (
        control
      )}
    </Field>
  );
}
