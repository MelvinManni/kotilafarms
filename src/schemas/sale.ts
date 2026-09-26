// Sales, payments, buyers and manure sales, shared by the forms and the API
import { z } from "zod";
import { farmDateSchema } from "@/schemas/set";
import { saleAmountsAgree } from "@/utils/metrics/sale-amounts";

const method = z.enum(["cash", "transfer", "pos"], { error: "Choose how they paid." });
const money = (what: string) => z.number({ error: `Enter ${what}.` }).int("Whole naira only.").min(0, `Enter ${what}.`);

const amountsAgree = (v: { birds?: number; pricePerBird?: number; total?: number }) =>
  v.birds === undefined || v.pricePerBird === undefined || v.total === undefined || saleAmountsAgree(v.birds, v.pricePerBird, v.total);
const notOverpaid = (v: { total?: number; paidAtSale?: number; deposit?: number }) =>
  v.total === undefined || (v.paidAtSale ?? 0) + (v.deposit ?? 0) <= v.total;

export const saleFieldsSchema = z.object({
  setId: z.uuid({ error: "Choose the Set." }),
  date: farmDateSchema,
  buyerId: z.uuid({ error: "Choose the buyer." }),
  birds: z.number({ error: "How many birds?" }).int().positive("How many birds?"),
  pricePerBird: money("the price per bird"),
  total: money("the sale total").positive("Enter the sale total."),
  paidAtSale: money("what was paid now"),
  deposit: money("the deposit").default(0),
  method,
  note: z.string().trim().max(500).nullable().optional(),
});

export const saleCreateSchema = saleFieldsSchema
  .extend({ clientId: z.uuid(), enteredOfflineAt: z.iso.datetime().optional() })
  .refine(amountsAgree, { message: "Birds × price per bird doesn't match the total.", path: ["total"] })
  .refine(notOverpaid, { message: "More is paid than the sale total.", path: ["paidAtSale"] });

export const saleEditSchema = saleFieldsSchema
  .omit({ deposit: true })
  .extend({ deposit: money("the deposit") })
  .partial()
  .extend({ baseVersion: z.number().int().positive(), reason: z.string().trim().max(500).optional() });

export const paymentCreateSchema = z.object({ clientId: z.uuid(), date: farmDateSchema, amount: money("the amount paid").positive("Enter the amount paid."), method });

export const buyerCreateSchema = z.object({
  clientId: z.uuid(),
  name: z.string().trim().min(2, "Enter the buyer's name.").max(80),
  phone: z.string().trim().max(30).nullable().optional(),
  note: z.string().trim().max(300).nullable().optional(),
});

export const otherSaleCreateSchema = z.object({ clientId: z.uuid(), setId: z.uuid({ error: "Choose the Set." }), date: farmDateSchema, amount: money("the amount").positive("Enter the amount."), kind: z.literal("manure").default("manure") });

export const saleFiltersSchema = z.object({ setId: z.uuid().optional(), buyerId: z.uuid().optional() });

export type SaleCreateInput = z.input<typeof saleCreateSchema>;
export type SaleCreate = z.output<typeof saleCreateSchema>;
export type SaleEdit = z.output<typeof saleEditSchema>;
export type PaymentCreate = z.output<typeof paymentCreateSchema>;
export type BuyerCreate = z.output<typeof buyerCreateSchema>;
export type OtherSaleCreate = z.output<typeof otherSaleCreateSchema>;
