// Starting a Set and changing its stage, shared by the form and the API
import * as z from "zod/mini";
import { text, whole } from "@/schemas/checks";

export const farmDateSchema = z.iso.date({ error: "Choose a date." });

export const setCreateSchema = z.object({
  clientId: z.uuid(),
  name: z.optional(text(60)),
  pen: text(40, { length: 1, message: "Which pen are they in?" }),
  startDate: farmDateSchema,
  intake: z.number({ error: "How many day-olds arrived?" }).check(whole(), z.positive("How many day-olds arrived?")),
  dayOldSupplier: z.string().check(z.trim(), z.minLength(1, "Who supplied the day-olds?")),
  dayOldUnitCost: z.number({ error: "Enter the price per day-old." }).check(whole(), z.gte(0, "Enter the price per day-old.")),
});

export const setStatusSchema = z.object({
  status: z.enum(["brooding", "growing", "selling", "closed"]),
  closedOn: z.optional(farmDateSchema),
});

export type SetCreateInput = z.infer<typeof setCreateSchema>;
export type SetStatusInput = z.infer<typeof setStatusSchema>;
