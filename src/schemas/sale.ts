// Sales, payments, buyers and manure sales, shared by the forms and the API
import * as z from "zod/mini";
import { text, whole } from "@/schemas/checks";
import { farmDateSchema } from "@/schemas/set";
import { saleAmountsAgree } from "@/utils/metrics/sale-amounts";

const method = z.enum(["cash", "transfer", "pos"], { error: "Choose how they paid." });
const money = (what: string) => z.number({ error: `Enter ${what}.` }).check(whole("Whole naira only."), z.gte(0, `Enter ${what}.`));
const moneyAbove0 = (what: string) => z.number({ error: `Enter ${what}.` }).check(whole("Whole naira only."), z.positive(`Enter ${what}.`));

type Amounts = { birds?: number; pricePerBird?: number; total?: number; paidAtSale?: number; deposit?: number };
const amountsAgree = (v: Amounts) => v.birds === undefined || v.pricePerBird === undefined || v.total === undefined || saleAmountsAgree(v.birds, v.pricePerBird, v.total);
const notOverpaid = (v: Amounts) => v.total === undefined || (v.paidAtSale ?? 0) + (v.deposit ?? 0) <= v.total;

export const saleFieldsSchema = z.object({
  setId: z.uuid({ error: "Choose the Set." }),
  date: farmDateSchema,
  buyerId: z.uuid({ error: "Choose the buyer." }),
  birds: z.number({ error: "How many birds?" }).check(whole(), z.positive("How many birds?")),
  pricePerBird: money("the price per bird"),
  total: moneyAbove0("the sale total"),
  paidAtSale: money("what was paid now"),
  deposit: z._default(money("the deposit"), 0),
  method,
  note: z.optional(z.nullable(text(500))),
});

export const saleCreateSchema = z
  .extend(saleFieldsSchema, { clientId: z.uuid(), enteredOfflineAt: z.optional(z.iso.datetime()) })
  .check(
    z.refine<Amounts>(amountsAgree, { message: "Birds × price per bird doesn't match the total.", path: ["total"] }),
    z.refine<Amounts>(notOverpaid, { message: "More is paid than the sale total.", path: ["paidAtSale"] }),
  );

export const saleEditSchema = z.extend(z.partial(z.extend(z.omit(saleFieldsSchema, { deposit: true }), { deposit: money("the deposit") })), {
  baseVersion: z.number().check(whole(), z.positive()),
  reason: z.optional(text(500)),
});

export const paymentCreateSchema = z.object({ clientId: z.uuid(), date: farmDateSchema, amount: moneyAbove0("the amount paid"), method });

export const buyerCreateSchema = z.object({
  clientId: z.uuid(),
  name: text(80, { length: 2, message: "Enter the buyer's name." }),
  phone: z.optional(z.nullable(text(30))),
  note: z.optional(z.nullable(text(300))),
});

export const otherSaleCreateSchema = z.object({ clientId: z.uuid(), setId: z.uuid({ error: "Choose the Set." }), date: farmDateSchema, amount: moneyAbove0("the amount"), kind: z._default(z.literal("manure"), "manure") });

export const saleFiltersSchema = z.object({ setId: z.optional(z.uuid()), buyerId: z.optional(z.uuid()) });

export type SaleCreateInput = z.input<typeof saleCreateSchema>;
export type SaleCreate = z.output<typeof saleCreateSchema>;
export type SaleEdit = z.output<typeof saleEditSchema>;
export type PaymentCreate = z.output<typeof paymentCreateSchema>;
export type BuyerCreate = z.output<typeof buyerCreateSchema>;
export type OtherSaleCreate = z.output<typeof otherSaleCreateSchema>;
