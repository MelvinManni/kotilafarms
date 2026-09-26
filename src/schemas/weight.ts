// A weight sample: each bird's weight in grams (the stats are worked out, never typed)
import { z } from "zod";
import { farmDateSchema } from "@/schemas/set";

export const birdGrams = z.number({ error: "Type the weight in grams." }).int("Grams only, no decimals.").min(20, "That's too light for a bird — check it.").max(8000, "That's too heavy — type grams, e.g. 1030.");

export const weightSampleCreateSchema = z.object({
  clientId: z.uuid(),
  date: farmDateSchema,
  weightsGrams: z.array(birdGrams).min(1, "Weigh at least one bird.").max(500),
  enteredOfflineAt: z.iso.datetime().optional(),
});

export const breedCurveSchema = z.object({
  points: z
    .array(z.object({ day: z.number().int().min(0).max(70), grams: z.number().int().min(20).max(8000) }))
    .min(2, "The curve needs at least two points.")
    .refine((p) => new Set(p.map((x) => x.day)).size === p.length, "Each day can appear only once."),
});

export type WeightSampleCreate = z.output<typeof weightSampleCreateSchema>;

// A typed scale reading ("1,030" or "1030") as grams, or why it can't be used
export function parseGrams(text: string): { grams: number } | { error: string } {
  const clean = text.replace(/[\s,]/g, "").replace(/g$/i, "");
  const result = birdGrams.safeParse(clean === "" ? Number.NaN : Number(clean));
  return result.success ? { grams: result.data } : { error: result.error.issues[0]?.message ?? "Type the weight in grams." };
}
