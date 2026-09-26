// Field label with a red * when required, or "optional"
import type { ReactNode } from "react";

type FieldLabelProps = {
  children: ReactNode;
  htmlFor?: string;
  id?: string;
  required?: boolean;
  optional?: boolean;
};

export function FieldLabel({ children, htmlFor, id, required, optional }: FieldLabelProps) {
  const Tag = htmlFor ? "label" : "span";
  return (
    <Tag htmlFor={htmlFor} id={id} className="text-[15px] leading-5 font-semibold text-ink">
      {children}
      {required ? (
        <span className="ml-0.5 text-alert" aria-hidden>
          {" *"}
        </span>
      ) : null}
      {optional ? <span className="ml-1.5 text-caption font-medium text-ink-muted">optional</span> : null}
    </Tag>
  );
}
