// Cash counts and P&L queries, shared by the forms and the API
import { z } from "zod";

const naira = (what: string) => z.number({ error: `Enter ${what}.` }).int("Whole naira only.").min(0, `Enter ${what}.`);

export const reconciliationSchema = z.object({
  countedCash: naira("the cash counted"),
  bankBalance: naira("the bank balance"),
  note: z.string().trim().max(500).nullable().optional(),
});

export const pnlQuerySchema = z.object({
  setIds: z.string().transform((v) => [...new Set(v.split(",").filter(Boolean))]).pipe(z.array(z.uuid()).min(1, "Choose at least one Set.").max(50)),
});

export type ReconciliationInput = z.input<typeof reconciliationSchema>;

// Compare needs at least two Sets
export const compareQuerySchema = z.object({
  setIds: z.string().transform((v) => [...new Set(v.split(",").filter(Boolean))]).pipe(z.array(z.uuid()).min(2, "Pick at least two Sets to compare.").max(10)),
});
