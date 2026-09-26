"use client";
// 22px checkbox with a green tick; the whole row is tappable
import { useId, type ReactNode } from "react";
import { Checkbox as CheckboxBase } from "@/components/ui/checkbox";

type CheckboxProps = {
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

export function Checkbox({ label, checked, defaultChecked, onChange }: CheckboxProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-[15px] leading-snug font-medium text-ink-2">
      <CheckboxBase
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(next) => onChange?.(next)}
        className="size-5.5 rounded-[6px] border-[1.5px] border-line-strong focus-visible:shadow-focus focus-visible:ring-0 data-checked:border-green-600 data-checked:bg-green-600"
      />
      <span>{label}</span>
    </label>
  );
}
