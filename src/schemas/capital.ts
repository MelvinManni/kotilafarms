// Shareholders, capital in and out, and shareholder loans (owners only; never queued offline)
import { z } from "zod";
import { farmDateSchema } from "@/schemas/set";

const naira = (what: string) => z.number({ error: `Enter ${what}.` }).int("Whole naira only.").positive(`Enter ${what}.`);

export const shareholderCreateSchema = z.object({
  clientId: z.uuid(),
  name: z.string().trim().min(2, "Enter the shareholder's name.").max(80),
  shares: z.number({ error: "Enter the shares held." }).int("Whole shares only.").positive("Enter the shares held."),
});

export const capitalEntryCreateSchema = z.object({
  clientId: z.uuid(),
  shareholderId: z.uuid({ error: "Choose the shareholder." }),
  date: farmDateSchema,
  kind: z.enum(["contributed", "withdrawn"], { error: "Money in or out?" }),
  amount: naira("the amount"),
  note: z.string().trim().max(300).nullable().optional(),
});

export const loanCreateSchema = z.object({
  clientId: z.uuid(),
  lenderShareholderId: z.uuid({ error: "Choose who lent it." }),
  amount: naira("the amount lent"),
  advancedOn: farmDateSchema,
});

export const loanRepaySchema = z.object({ repaidOn: farmDateSchema, baseVersion: z.number().int().positive() });

export type ShareholderCreate = z.output<typeof shareholderCreateSchema>;
export type CapitalEntryCreate = z.output<typeof capitalEntryCreateSchema>;
export type LoanCreate = z.output<typeof loanCreateSchema>;
export type LoanRepay = z.output<typeof loanRepaySchema>;
