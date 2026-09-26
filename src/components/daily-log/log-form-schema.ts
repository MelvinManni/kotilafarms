// The entry form's values: the log fields plus a reason for late changes
import { z } from "zod";
import { CAUSE_VALUES } from "@/constants/death-causes";
import { TAG_VALUES } from "@/constants/observation-tags";

export const logFormSchema = z
  .object({
    deaths: z.number().int().min(0, "Deaths can't be below 0."),
    deathCause: z.enum(CAUSE_VALUES).nullable(),
    feedUnit: z.enum(["bags", "kg"]),
    feedQty: z.number().min(0).nullable(),
    feedTypeId: z.string().nullable(),
    waterLevel: z.enum(["low", "normal", "high"]).nullable(),
    tempC: z.number().min(0).max(50, "That temperature looks wrong. Check it.").nullable(),
    tags: z.array(z.enum(TAG_VALUES)),
    note: z.string(),
    reason: z.string(),
  })
  .refine((v) => !v.feedQty || Boolean(v.feedTypeId), { message: "Choose the feed type.", path: ["feedTypeId"] });

export type LogFormValues = z.infer<typeof logFormSchema>;
