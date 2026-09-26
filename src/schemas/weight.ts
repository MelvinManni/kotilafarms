// A weight sample: each bird's weight in grams (the stats are worked out, never typed)
import * as z from "zod/mini";
import { whole } from "@/schemas/checks";
import { farmDateSchema } from "@/schemas/set";

export const birdGrams = z.number({ error: "Type the weight in grams." }).check(whole("Grams only, no decimals."), z.gte(20, "That's too light for a bird — check it."), z.lte(8000, "That's too heavy — type grams, e.g. 1030."));

export const weightSampleCreateSchema = z.object({
  clientId: z.uuid(),
  date: farmDateSchema,
  weightsGrams: z.array(birdGrams).check(z.minLength(1, "Weigh at least one bird."), z.maxLength(500)),
  enteredOfflineAt: z.optional(z.iso.datetime()),
});

type Point = { day: number; grams: number };

export const breedCurveSchema = z.object({
  points: z
    .array(z.object({ day: z.number().check(whole(), z.gte(0), z.lte(70)), grams: z.number().check(whole(), z.gte(20), z.lte(8000)) }))
    .check(z.minLength(2, "The curve needs at least two points."), z.refine<Point[]>((p) => new Set(p.map((x) => x.day)).size === p.length, "Each day can appear only once.")),
});

export type WeightSampleCreate = z.output<typeof weightSampleCreateSchema>;

// A typed scale reading ("1,030" or "1030") as grams, or why it can't be used
export function parseGrams(text: string): { grams: number } | { error: string } {
  const clean = text.replace(/[\s,]/g, "").replace(/g$/i, "");
  const result = birdGrams.safeParse(clean === "" ? Number.NaN : Number(clean));
  return result.success ? { grams: result.data } : { error: result.error.issues[0]?.message ?? "Type the weight in grams." };
}
