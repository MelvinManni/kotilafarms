"use client";
// Password field with a show/hide button inside it
import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/kotila/fields/field";
import { inputClasses } from "@/components/kotila/fields/input-classes";
import { Icon } from "@/svgs/icon";
import { cn } from "@/utils/cn";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoComplete: "current-password" | "new-password";
  error?: string;
  hint?: React.ReactNode;
  aside?: React.ReactNode;
};

export function PasswordInput({ label, value, onChange, onBlur, autoComplete, error, hint, aside }: PasswordInputProps) {
  const id = useId();
  const [shown, setShown] = useState(false);
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint} aside={aside} messageId={`${id}-message`}>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-message` : undefined}
          className={cn(inputClasses, "pr-15")}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          title={shown ? "Hide password" : "Show password"}
          className="absolute top-1.5 right-1.5 flex size-11 cursor-pointer items-center justify-center rounded-sm text-ink-muted outline-none focus-visible:shadow-focus"
        >
          <Icon name={shown ? "x" : "eye"} />
        </button>
      </div>
    </Field>
  );
}
