// The expense sheet's values: attribution is one choice, a Set id or "overhead"
import * as z from "zod/mini";
import { whole } from "@/schemas/checks";
import { farmDateSchema } from "@/schemas/set";

export const expenseFormSchema = z.object({
  amount: z.number({ error: "Enter the amount." }).check(whole("Whole naira only."), z.positive("Enter the amount.")),
  categoryId: z.string().check(z.minLength(1, "Choose a category.")),
  description: z.string().check(z.trim(), z.minLength(1, "Say what it was for.")),
  attribution: z.string({ error: "Choose a Set or farm overhead before saving." }).check(z.minLength(1, "Choose a Set or farm overhead before saving.")),
  date: farmDateSchema,
  capitalItem: z.boolean(),
  receiptKey: z.nullable(z.string()),
  reason: z.string(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

// "overhead" or a Set id → the API's setId + overhead pair
export const attributionToApi = (attribution: string) =>
  attribution === "overhead" ? { setId: null, overhead: true } : { setId: attribution, overhead: false };
