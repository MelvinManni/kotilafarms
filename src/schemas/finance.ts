// Cash counts and P&L queries, shared by the forms and the API
import * as z from "zod/mini";
import { text, whole } from "@/schemas/checks";

const naira = (what: string) => z.number({ error: `Enter ${what}.` }).check(whole("Whole naira only."), z.gte(0, `Enter ${what}.`));

export const reconciliationSchema = z.object({
  countedCash: naira("the cash counted"),
  bankBalance: naira("the bank balance"),
  note: z.optional(z.nullable(text(500))),
});

// "a,b,a" → ["a", "b"], then checked as Set ids
const setIdList = (min: number, message: string, max: number) =>
  z.pipe(z.pipe(z.string(), z.transform((v) => [...new Set(v.split(",").filter(Boolean))])), z.array(z.uuid()).check(z.minLength(min, message), z.maxLength(max)));

export const pnlQuerySchema = z.object({ setIds: setIdList(1, "Choose at least one Set.", 50) });

// Compare needs at least two Sets
export const compareQuerySchema = z.object({ setIds: setIdList(2, "Pick at least two Sets to compare.", 10) });

export type ReconciliationInput = z.input<typeof reconciliationSchema>;
