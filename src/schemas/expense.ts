// An expense: every naira out belongs to one Set or to farm overhead — never neither, never both
import * as z from "zod/mini";
import { text, whole } from "@/schemas/checks";
import { farmDateSchema } from "@/schemas/set";

type Attribution = { setId?: string | null; overhead?: boolean };
const setOrOverhead = (v: Attribution) => Boolean(v.setId) !== Boolean(v.overhead);
const attributionIssue = { message: "Choose a Set or farm overhead before saving.", path: ["setId"] };

export const expenseFieldsSchema = z.object({
  date: farmDateSchema,
  categoryId: z.uuid({ error: "Choose a category." }),
  description: text(200, { length: 1, message: "Say what it was for." }),
  amount: z.number({ error: "Enter the amount." }).check(whole("Whole naira only."), z.positive("Enter the amount.")),
  setId: z.nullable(z.uuid()),
  overhead: z.boolean(),
  paidByUserId: z.optional(z.nullable(z.uuid())),
  receiptKey: z.optional(z.nullable(z.string().check(z.maxLength(300)))),
  capitalItem: z._default(z.boolean(), false),
  spreadOverSets: z.optional(z.nullable(z.number().check(whole(), z.gte(1), z.lte(20)))),
});

export const expenseCreateSchema = z.extend(expenseFieldsSchema, { clientId: z.uuid(), enteredOfflineAt: z.optional(z.iso.datetime()) }).check(z.refine<Attribution>(setOrOverhead, attributionIssue));

// Edits send the whole attribution pair together, or neither
export const expenseEditSchema = z
  .extend(z.partial(z.extend(z.omit(expenseFieldsSchema, { capitalItem: true }), { capitalItem: z.boolean() })), { baseVersion: z.number().check(whole(), z.positive()), reason: z.optional(text(500)) })
  .check(z.refine<Attribution>((v) => (v.setId === undefined && v.overhead === undefined) || setOrOverhead(v), attributionIssue));

export const expenseFiltersSchema = z.object({
  set: z.optional(z.union([z.uuid(), z.literal("overhead")])),
  categoryId: z.optional(z.uuid()),
  month: z.optional(z.string().check(z.regex(/^\d{4}-\d{2}$/))),
  show: z._default(z.enum(["all", "sets", "overhead"]), "all"),
});

export const categoryCreateSchema = z.object({
  name: text(60, { length: 2, message: "Name the category." }),
  isCapitalEligible: z._default(z.boolean(), false),
});

export const categoryUpdateSchema = z.partial(categoryCreateSchema);

export type ExpenseCreateInput = z.input<typeof expenseCreateSchema>;
export type ExpenseCreate = z.output<typeof expenseCreateSchema>;
export type ExpenseEdit = z.output<typeof expenseEditSchema>;
export type ExpenseFilters = z.output<typeof expenseFiltersSchema>;
