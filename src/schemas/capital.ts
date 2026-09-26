// Shareholders, capital in and out, and shareholder loans (owners only; never queued offline)
import * as z from "zod/mini";
import { text, whole } from "@/schemas/checks";
import { farmDateSchema } from "@/schemas/set";

const naira = (what: string) => z.number({ error: `Enter ${what}.` }).check(whole("Whole naira only."), z.positive(`Enter ${what}.`));
const version = z.number().check(whole(), z.positive());
const shareholderName = text(80, { length: 2, message: "Enter the shareholder's name." });
const shares = z.number({ error: "Enter the shares held." }).check(whole("Whole shares only."), z.positive("Enter the shares held."));

export const shareholderCreateSchema = z.object({ clientId: z.uuid(), name: shareholderName, shares });

// Fix a name or share count in the register; the reason is kept with the change
export const shareholderUpdateSchema = z.object({
  name: z.optional(shareholderName),
  shares: z.optional(shares),
  baseVersion: version,
  reason: text(300, { length: 3, message: "Say why the register changed." }),
});

export const capitalEntryCreateSchema = z.object({
  clientId: z.uuid(),
  shareholderId: z.uuid({ error: "Choose the shareholder." }),
  date: farmDateSchema,
  kind: z.enum(["contributed", "withdrawn"], { error: "Money in or out?" }),
  amount: naira("the amount"),
  note: z.optional(z.nullable(text(300))),
});

export const loanCreateSchema = z.object({
  clientId: z.uuid(),
  lenderShareholderId: z.uuid({ error: "Choose who lent it." }),
  amount: naira("the amount lent"),
  advancedOn: farmDateSchema,
});

export const loanRepaySchema = z.object({ repaidOn: farmDateSchema, baseVersion: version });

export type ShareholderCreate = z.output<typeof shareholderCreateSchema>;
export type ShareholderUpdate = z.output<typeof shareholderUpdateSchema>;
export type CapitalEntryCreate = z.output<typeof capitalEntryCreateSchema>;
export type LoanCreate = z.output<typeof loanCreateSchema>;
export type LoanRepay = z.output<typeof loanRepaySchema>;
