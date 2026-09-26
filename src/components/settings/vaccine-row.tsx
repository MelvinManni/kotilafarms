// One default vaccine dose: what, which dose, day of age, how it's given, with remove
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { IconButton } from "@/components/kotila/icon-button";
import { inputClasses } from "@/components/kotila/fields/input-classes";
import type { VaccineSchedule } from "@/schemas/health";
import { cn } from "@/utils/cn";

type Props = { index: number; register: UseFormRegister<VaccineSchedule>; errors?: FieldErrors<VaccineSchedule["rows"][number]>; onRemove: () => void };

export function VaccineRow({ index, register, errors, onRemove }: Props) {
  const cell = cn(inputClasses, "h-11 min-h-11 px-3 text-base");
  const n = index + 1;
  const message = errors?.item?.message ?? errors?.method?.message ?? errors?.doseNo?.message ?? errors?.dueAgeDays?.message;
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_1.4fr_44px] items-center gap-2">
        <input aria-label={`Row ${n}: vaccine`} aria-invalid={Boolean(errors?.item)} className={cell} {...register(`rows.${index}.item`)} />
        <input type="number" inputMode="numeric" aria-label={`Row ${n}: dose`} className={cell} {...register(`rows.${index}.doseNo`, { valueAsNumber: true })} />
        <input type="number" inputMode="numeric" aria-label={`Row ${n}: day of age`} className={cell} {...register(`rows.${index}.dueAgeDays`, { valueAsNumber: true })} />
        <input aria-label={`Row ${n}: how it is given`} aria-invalid={Boolean(errors?.method)} className={cell} {...register(`rows.${index}.method`)} />
        <IconButton icon="x" label={`Remove row ${n}`} onClick={onRemove} />
      </div>
      {message ? <span className="text-caption font-medium text-alert">{message}</span> : null}
    </div>
  );
}
