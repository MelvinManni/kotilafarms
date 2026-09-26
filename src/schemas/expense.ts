// An expense: every naira out belongs to one Set or to farm overhead — never neither, never both
import { z } from "zod";
import { farmDateSchema } from "@/schemas/set";

const setOrOverhead = (v: { setId?: string | null; overhead?: boolean }) => Boolean(v.setId) !== Boolean(v.overhead);
const attributionIssue = { message: "Choose a Set or farm overhead before saving.", path: ["setId"] };

export const expenseFieldsSchema = z.object({
  date: farmDateSchema,
  categoryId: z.uuid({ error: "Choose a category." }),
  description: z.string().trim().min(1, "Say what it was for.").max(200),
  amount: z.number({ error: "Enter the amount." }).int("Whole naira only.").positive("Enter the amount."),
  setId: z.uuid().nullable(),
  overhead: z.boolean(),
  paidByUserId: z.uuid().nullable().optional(),
  receiptKey: z.string().max(300).nullable().optional(),
  capitalItem: z.boolean().default(false),
  spreadOverSets: z.number().int().min(1).max(20).nullable().optional(),
});

export const expenseCreateSchema = expenseFieldsSchema.extend({ clientId: z.uuid(), enteredOfflineAt: z.iso.datetime().optional() }).refine(setOrOverhead, attributionIssue);

// Edits send the whole attribution pair together, or neither
export const expenseEditSchema = expenseFieldsSchema
  .omit({ capitalItem: true })
  .extend({ capitalItem: z.boolean() })
  .partial()
  .extend({ baseVersion: z.number().int().positive(), reason: z.string().trim().max(500).optional() })
  .refine((v) => (v.setId === undefined && v.overhead === undefined) || setOrOverhead(v), attributionIssue);

export const expenseFiltersSchema = z.object({
  set: z.union([z.uuid(), z.literal("overhead")]).optional(),
  categoryId: z.uuid().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  show: z.enum(["all", "sets", "overhead"]).default("all"),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, "Name the category.").max(60),
  isCapitalEligible: z.boolean().default(false),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type ExpenseCreateInput = z.input<typeof expenseCreateSchema>;
export type ExpenseCreate = z.output<typeof expenseCreateSchema>;
export type ExpenseEdit = z.output<typeof expenseEditSchema>;
export type ExpenseFilters = z.output<typeof expenseFiltersSchema>;
