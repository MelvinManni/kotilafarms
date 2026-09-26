// Vaccines given, drug and supplement records, and the farm's default vaccine schedule
import { z } from "zod";
import { farmDateSchema } from "@/schemas/set";

// Mark a Set's vaccine as given on a day, or clear it (given by mistake)
export const vaccineMarkSchema = z.object({
  vaccineId: z.uuid(),
  givenOn: farmDateSchema.nullable(),
  note: z.string().trim().max(300).nullable().optional(),
});

export const healthRecordCreateSchema = z.object({
  clientId: z.uuid(),
  setId: z.uuid({ error: "Choose the Set." }),
  date: farmDateSchema,
  item: z.string().trim().min(2, "What was given?").max(80),
  dose: z.string().trim().min(1, "How much, and for how long?").max(120),
  cost: z.number().int("Whole naira only.").min(0).nullable().optional(),
  reason: z.string().trim().min(3, "Say why it was given.").max(300),
});

export const vaccineScheduleSchema = z.object({
  rows: z
    .array(z.object({ id: z.uuid().optional(), item: z.string().trim().min(2, "Name the vaccine.").max(60), doseNo: z.number().int().min(1).max(9), dueAgeDays: z.number().int().min(0).max(70), method: z.string().trim().min(2, "How is it given?").max(60) }))
    .max(20),
});

export type VaccineMark = z.output<typeof vaccineMarkSchema>;
export type HealthRecordCreateInput = z.input<typeof healthRecordCreateSchema>;
export type HealthRecordCreate = z.output<typeof healthRecordCreateSchema>;
export type VaccineSchedule = z.output<typeof vaccineScheduleSchema>;
