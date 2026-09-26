// Feed purchases, ingredient purchases and feed types, shared by the forms and the API
import { z } from "zod";
import { farmDateSchema } from "@/schemas/set";
import { linkedAmountsAgree } from "@/utils/metrics/linked-amounts-agree";

const naira = (what: string) => z.number({ error: `Enter ${what}.` }).int("Whole naira only.").positive(`Enter ${what}.`);
const amount = (what: string) => z.number({ error: `Enter ${what}.` }).positive(`Enter ${what}.`).max(100_000).multipleOf(0.01, "Two decimal places at most.");
const agree = (q: "bags" | "quantity", u: "pricePerBag" | "unitCost") => (v: Record<string, unknown>) =>
  typeof v[q] !== "number" || typeof v[u] !== "number" || typeof v.total !== "number" || linkedAmountsAgree(v[q], v[u], v.total);
const setOrOverhead = (v: { setId?: string | null; overhead?: boolean }) => Boolean(v.setId) !== Boolean(v.overhead);

export const feedPurchaseCreateSchema = z
  .object({
    clientId: z.uuid(),
    date: farmDateSchema,
    feedTypeId: z.uuid({ error: "Choose the feed." }),
    bags: amount("the number of bags"),
    kgPerBag: z.number({ error: "Enter the weight per bag." }).positive("Enter the weight per bag.").max(100),
    pricePerBag: naira("the price per bag"),
    total: naira("the total cost"),
    transportCost: z.number().int("Whole naira only.").min(0).default(0),
    supplier: z.string().trim().min(2, "Who sold it?").max(120),
    setId: z.uuid().nullable(),
    overhead: z.boolean(),
  })
  .refine(agree("bags", "pricePerBag"), { message: "Bags × price per bag doesn't match the total.", path: ["total"] })
  .refine(setOrOverhead, { message: "Choose the Set that will eat it, or the farm store.", path: ["setId"] });

export const ingredientPurchaseCreateSchema = z
  .object({
    clientId: z.uuid(),
    date: farmDateSchema,
    setId: z.uuid({ error: "Choose the Set it feeds." }),
    ingredient: z.string().trim().min(2, "Name the ingredient.").max(60),
    quantity: amount("the quantity"),
    unit: z.enum(["kg", "litres", "bags", "pieces"], { error: "Choose the unit." }),
    unitCost: naira("the cost each"),
    total: naira("the total cost"),
    supplier: z.string().trim().max(120).nullable().optional(),
  })
  .refine(agree("quantity", "unitCost"), { message: "Quantity × cost each doesn't match the total.", path: ["total"] });

export const feedTypeCreateSchema = z.object({
  kind: z.enum(["starter", "grower", "finisher"], { error: "Choose starter, grower or finisher." }),
  brand: z.string().trim().min(2, "Name the brand.").max(60),
  kgPerBag: z.number({ error: "Enter the weight per bag." }).positive("Enter the weight per bag.").max(100),
});

export const feedTypeUpdateSchema = feedTypeCreateSchema.partial().extend({ active: z.boolean().optional() });

export const INGREDIENT_UNITS = ["kg", "litres", "bags", "pieces"] as const;

export type FeedPurchaseCreateInput = z.input<typeof feedPurchaseCreateSchema>;
export type FeedPurchaseCreate = z.output<typeof feedPurchaseCreateSchema>;
export type IngredientPurchaseCreateInput = z.input<typeof ingredientPurchaseCreateSchema>;
export type IngredientPurchaseCreate = z.output<typeof ingredientPurchaseCreateSchema>;
export type FeedTypeCreate = z.output<typeof feedTypeCreateSchema>;
export type FeedTypeUpdate = z.output<typeof feedTypeUpdateSchema>;
