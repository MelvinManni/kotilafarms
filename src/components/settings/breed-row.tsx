// One point on the breed curve: day of age and grams, with remove
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { IconButton } from "@/components/kotila/icon-button";
import { inputClasses } from "@/components/kotila/fields/input-classes";
import { cn } from "@/utils/cn";

type Values = { points: { day: number; grams: number }[] };

type BreedRowProps = { index: number; register: UseFormRegister<Values>; errors?: FieldErrors<Values["points"][number]>; onRemove?: () => void };

export function BreedRow({ index, register, errors, onRemove }: BreedRowProps) {
  const cell = cn(inputClasses, "min-h-11 h-11 px-3 text-base");
  const message = errors?.day?.message ?? errors?.grams?.message;
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1fr_1fr_44px] items-center gap-2">
        <input type="number" inputMode="numeric" aria-label={`Row ${index + 1}: day of age`} aria-invalid={Boolean(errors?.day)} className={cell} {...register(`points.${index}.day`, { valueAsNumber: true })} />
        <input type="number" inputMode="numeric" aria-label={`Row ${index + 1}: standard grams`} aria-invalid={Boolean(errors?.grams)} className={cell} {...register(`points.${index}.grams`, { valueAsNumber: true })} />
        {onRemove ? <IconButton icon="x" label={`Remove row ${index + 1}`} onClick={onRemove} /> : <span />}
      </div>
      {message ? <span className="text-caption font-medium text-alert">{message}</span> : null}
    </div>
  );
}
