// Starting a Set and changing its stage, shared by the form and the API
import { z } from "zod";

export const farmDateSchema = z.iso.date({ error: "Choose a date." });

export const setCreateSchema = z.object({
  clientId: z.uuid(),
  name: z.string().trim().max(60).optional(),
  pen: z.string().trim().min(1, "Which pen are they in?").max(40),
  startDate: farmDateSchema,
  intake: z.number({ error: "How many day-olds arrived?" }).int().positive("How many day-olds arrived?"),
  dayOldSupplier: z.string().trim().min(1, "Who supplied the day-olds?"),
  dayOldUnitCost: z.number({ error: "Enter the price per day-old." }).int().min(0, "Enter the price per day-old."),
});

export const setStatusSchema = z.object({
  status: z.enum(["brooding", "growing", "selling", "closed"]),
  closedOn: farmDateSchema.optional(),
});

export type SetCreateInput = z.infer<typeof setCreateSchema>;
export type SetStatusInput = z.infer<typeof setStatusSchema>;
