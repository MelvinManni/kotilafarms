// Feed purchases, ingredient purchases and feed types, shared by the forms and the API
import * as z from "zod/mini";
import { text, whole } from "@/schemas/checks";
import { farmDateSchema } from "@/schemas/set";
import { linkedAmountsAgree } from "@/utils/metrics/linked-amounts-agree";

const naira = (what: string) => z.number({ error: `Enter ${what}.` }).check(whole("Whole naira only."), z.positive(`Enter ${what}.`));
const amount = (what: string) => z.number({ error: `Enter ${what}.` }).check(z.positive(`Enter ${what}.`), z.lte(100_000), z.multipleOf(0.01, "Two decimal places at most."));
const bagKg = z.number({ error: "Enter the weight per bag." }).check(z.positive("Enter the weight per bag."), z.lte(100));

type Linked = Record<string, unknown>;
const agree = (q: "bags" | "quantity", u: "pricePerBag" | "unitCost", message: string) =>
  z.refine<Linked>((v) => typeof v[q] !== "number" || typeof v[u] !== "number" || typeof v.total !== "number" || linkedAmountsAgree(v[q], v[u], v.total), { message, path: ["total"] });

export const feedPurchaseCreateSchema = z
  .object({
    clientId: z.uuid(),
    date: farmDateSchema,
    feedTypeId: z.uuid({ error: "Choose the feed." }),
    bags: amount("the number of bags"),
    kgPerBag: bagKg,
    pricePerBag: naira("the price per bag"),
    total: naira("the total cost"),
    transportCost: z._default(z.number().check(whole("Whole naira only."), z.gte(0)), 0),
    supplier: text(120, { length: 2, message: "Who sold it?" }),
    setId: z.nullable(z.uuid()),
    overhead: z.boolean(),
  })
  .check(
    agree("bags", "pricePerBag", "Bags × price per bag doesn't match the total."),
    z.refine<{ setId: string | null; overhead: boolean }>((v) => Boolean(v.setId) !== Boolean(v.overhead), { message: "Choose the Set that will eat it, or the farm store.", path: ["setId"] }),
  );

export const INGREDIENT_UNITS = ["kg", "litres", "bags", "pieces"] as const;

export const ingredientPurchaseCreateSchema = z
  .object({
    clientId: z.uuid(),
    date: farmDateSchema,
    setId: z.uuid({ error: "Choose the Set it feeds." }),
    ingredient: text(60, { length: 2, message: "Name the ingredient." }),
    quantity: amount("the quantity"),
    unit: z.enum(INGREDIENT_UNITS, { error: "Choose the unit." }),
    unitCost: naira("the cost each"),
    total: naira("the total cost"),
    supplier: z.optional(z.nullable(text(120))),
  })
  .check(agree("quantity", "unitCost", "Quantity × cost each doesn't match the total."));

export const feedTypeCreateSchema = z.object({
  kind: z.enum(["starter", "grower", "finisher"], { error: "Choose starter, grower or finisher." }),
  brand: text(60, { length: 2, message: "Name the brand." }),
  kgPerBag: bagKg,
});

export const feedTypeUpdateSchema = z.extend(z.partial(feedTypeCreateSchema), { active: z.optional(z.boolean()) });

export type FeedPurchaseCreateInput = z.input<typeof feedPurchaseCreateSchema>;
export type FeedPurchaseCreate = z.output<typeof feedPurchaseCreateSchema>;
export type IngredientPurchaseCreateInput = z.input<typeof ingredientPurchaseCreateSchema>;
export type IngredientPurchaseCreate = z.output<typeof ingredientPurchaseCreateSchema>;
export type FeedTypeCreate = z.output<typeof feedTypeCreateSchema>;
export type FeedTypeUpdate = z.output<typeof feedTypeUpdateSchema>;
