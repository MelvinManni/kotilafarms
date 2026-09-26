// The expense sheet's values: attribution is one choice, a Set id or "overhead"
import { z } from "zod";
import { farmDateSchema } from "@/schemas/set";

export const expenseFormSchema = z.object({
  amount: z.number({ error: "Enter the amount." }).int().positive("Enter the amount."),
  categoryId: z.string().min(1, "Choose a category."),
  description: z.string().trim().min(1, "Say what it was for."),
  attribution: z.string({ error: "Choose a Set or farm overhead before saving." }).min(1, "Choose a Set or farm overhead before saving."),
  date: farmDateSchema,
  capitalItem: z.boolean(),
  receiptKey: z.string().nullable(),
  reason: z.string(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

// "overhead" or a Set id → the API's setId + overhead pair
export const attributionToApi = (attribution: string) =>
  attribution === "overhead" ? { setId: null, overhead: true } : { setId: attribution, overhead: false };
