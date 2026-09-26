// Label, control, then one line of hint or error
import type { ReactNode } from "react";
import { FieldLabel } from "@/components/kotila/fields/field-label";
import { FieldMessage } from "@/components/kotila/fields/field-message";

type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
  labelId?: string;
  messageId?: string;
  aside?: ReactNode;
  children: ReactNode;
};

export function Field({ label, hint, error, required, optional, htmlFor, labelId, messageId, aside, children }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label || aside ? (
        <div className="flex items-baseline justify-between gap-3">
          {label ? (
            <FieldLabel htmlFor={htmlFor} id={labelId} required={required} optional={optional}>
              {label}
            </FieldLabel>
          ) : null}
          {aside}
        </div>
      ) : null}
      {children}
      <FieldMessage error={error} hint={hint} id={messageId} />
    </div>
  );
}
