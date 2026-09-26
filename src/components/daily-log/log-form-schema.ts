// The entry form's values: the log fields plus a reason for late changes
import * as z from "zod/mini";
import { CAUSE_VALUES } from "@/constants/death-causes";
import { TAG_VALUES } from "@/constants/observation-tags";
import { whole } from "@/schemas/checks";

export const logFormSchema = z
  .object({
    deaths: z.number().check(whole(), z.gte(0, "Deaths can't be below 0.")),
    deathCause: z.nullable(z.enum(CAUSE_VALUES)),
    feedUnit: z.enum(["bags", "kg"]),
    feedQty: z.nullable(z.number().check(z.gte(0))),
    feedTypeId: z.nullable(z.string()),
    waterLevel: z.nullable(z.enum(["low", "normal", "high"])),
    tempC: z.nullable(z.number().check(z.gte(0), z.lte(50, "That temperature looks wrong. Check it."))),
    tags: z.array(z.enum(TAG_VALUES)),
    note: z.string(),
    reason: z.string(),
  })
  .check(z.refine<{ feedQty: number | null; feedTypeId: string | null }>((v) => !v.feedQty || Boolean(v.feedTypeId), { message: "Choose the feed type.", path: ["feedTypeId"] }));

export type LogFormValues = z.infer<typeof logFormSchema>;
