// Vaccines given, drug and supplement records, the farm's default schedule, and one Set's own schedule
import * as z from "zod/mini";
import { text, whole } from "@/schemas/checks";
import { farmDateSchema } from "@/schemas/set";

// Mark a Set's vaccine as given on a day, or clear it (given by mistake)
export const vaccineMarkSchema = z.object({
  vaccineId: z.uuid(),
  givenOn: z.nullable(farmDateSchema),
  note: z.optional(z.nullable(text(300))),
});

export const healthRecordCreateSchema = z.object({
  clientId: z.uuid(),
  setId: z.uuid({ error: "Choose the Set." }),
  date: farmDateSchema,
  item: text(80, { length: 2, message: "What was given?" }),
  dose: text(120, { length: 1, message: "How much, and for how long?" }),
  cost: z.optional(z.nullable(z.number().check(whole("Whole naira only."), z.gte(0)))),
  reason: text(300, { length: 3, message: "Say why it was given." }),
});

const dose = {
  item: text(60, { length: 2, message: "Name the vaccine." }),
  doseNo: z.number().check(whole(), z.gte(1), z.lte(9)),
  dueAgeDays: z.number({ error: "Enter the day of age." }).check(whole(), z.gte(0), z.lte(70)),
};

export const vaccineScheduleSchema = z.object({
  rows: z.array(z.object({ id: z.optional(z.uuid()), ...dose, method: text(60, { length: 2, message: "How is it given?" }) })).check(z.maxLength(20)),
});

// One Set's own schedule: move a due day, add a dose, or drop one not given yet (the farm defaults stay as they are)
export const setScheduleSchema = z.object({
  rows: z.array(z.object({ id: z.optional(z.uuid()), ...dose, version: z.optional(z.number()) })).check(z.maxLength(20)),
  reason: z.optional(text(300)),
});

export type VaccineMark = z.output<typeof vaccineMarkSchema>;
export type HealthRecordCreateInput = z.input<typeof healthRecordCreateSchema>;
export type HealthRecordCreate = z.output<typeof healthRecordCreateSchema>;
export type VaccineSchedule = z.output<typeof vaccineScheduleSchema>;
export type SetSchedule = z.output<typeof setScheduleSchema>;
