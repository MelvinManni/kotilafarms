// Small checks shared by the zod/mini schemas
import * as z from "zod/mini";

// Whole numbers only (naira, grams, birds), with a plain message
export const whole = (message = "Whole numbers only.") => z.refine<number>((n) => Number.isInteger(n), { message });

// Trimmed text between two lengths
export const text = (max: number, min?: { length: number; message: string }) =>
  min ? z.string().check(z.trim(), z.minLength(min.length, min.message), z.maxLength(max)) : z.string().check(z.trim(), z.maxLength(max));
