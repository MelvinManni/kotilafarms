// One dose on a Set's schedule: vaccine, dose number, day of age; a dose already given can't be removed
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { IconButton } from "@/components/kotila/icon-button";
import { inputClasses } from "@/components/kotila/fields/input-classes";
import type { SetSchedule } from "@/schemas/health";
import { cn } from "@/utils/cn";

type Props = { index: number; given: string | null; register: UseFormRegister<SetSchedule>; errors?: FieldErrors<SetSchedule["rows"][number]>; onRemove: () => void };

export function SetDoseRow({ index, given, register, errors, onRemove }: Props) {
  const cell = cn(inputClasses, "h-11 min-h-11 px-3 text-base");
  const n = index + 1;
  const message = errors?.item?.message ?? errors?.doseNo?.message ?? errors?.dueAgeDays?.message;
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1.6fr_0.7fr_0.9fr_44px] items-center gap-2">
        <input aria-label={`Row ${n}: vaccine`} aria-invalid={Boolean(errors?.item)} className={cell} {...register(`rows.${index}.item`)} />
        <input type="number" inputMode="numeric" aria-label={`Row ${n}: dose`} className={cell} {...register(`rows.${index}.doseNo`, { valueAsNumber: true })} />
        <input type="number" inputMode="numeric" aria-label={`Row ${n}: due on day`} aria-invalid={Boolean(errors?.dueAgeDays)} className={cell} {...register(`rows.${index}.dueAgeDays`, { valueAsNumber: true })} />
        {given ? <span className="text-center text-caption font-semibold text-green-700">Given</span> : <IconButton icon="x" label={`Remove row ${n}`} onClick={onRemove} />}
      </div>
      {message ? <span className="text-caption font-medium text-alert">{message}</span> : null}
    </div>
  );
}
