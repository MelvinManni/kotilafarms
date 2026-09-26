// A day's log for one Set, shared by the entry form, the API and offline sync
import { z } from "zod";
import { CAUSE_VALUES } from "@/constants/death-causes";
import { TAG_VALUES } from "@/constants/observation-tags";
import { farmDateSchema } from "@/schemas/set";

// No defaults here: an edit must only touch the fields it sends
export const dailyLogFieldsSchema = z.object({
  deaths: z.number({ error: "Enter how many died, or 0." }).int().min(0, "Deaths can't be below 0."),
  deathCause: z.enum(CAUSE_VALUES).nullable().optional(),
  feedTypeId: z.uuid().nullable().optional(),
  feedQty: z.number().min(0, "Feed can't be below 0.").max(1000).nullable().optional(),
  feedUnit: z.enum(["bags", "kg"]),
  waterLevel: z.enum(["low", "normal", "high"]).nullable().optional(),
  waterLitres: z.number().int().min(0).nullable().optional(),
  tempC: z.number().min(0).max(50, "That temperature looks wrong. Check it.").nullable().optional(),
  tags: z.array(z.enum(TAG_VALUES)),
  note: z.string().trim().max(1000).nullable().optional(),
});

const feedNeedsType = (v: { feedQty?: number | null; feedTypeId?: string | null }) => !v.feedQty || Boolean(v.feedTypeId);
const feedTypeIssue = { message: "Choose the feed type.", path: ["feedTypeId"] };

export const dailyLogUpsertSchema = dailyLogFieldsSchema
  .extend({
    feedUnit: z.enum(["bags", "kg"]).default("bags"),
    tags: z.array(z.enum(TAG_VALUES)).default([]),
    clientId: z.uuid(),
    date: farmDateSchema,
    // Version the edit started from; left out when creating
    baseVersion: z.number().int().positive().optional(),
    reason: z.string().trim().max(500).optional(),
    enteredOfflineAt: z.iso.datetime().optional(),
  })
  .refine(feedNeedsType, feedTypeIssue);

export const dailyLogEditSchema = dailyLogFieldsSchema
  .partial()
  .extend({ baseVersion: z.number().int().positive(), reason: z.string().trim().max(500).optional() })
  .refine(feedNeedsType, feedTypeIssue);

export type DailyLogUpsertInput = z.input<typeof dailyLogUpsertSchema>;
export type DailyLogUpsert = z.output<typeof dailyLogUpsertSchema>;
export type DailyLogEdit = z.output<typeof dailyLogEditSchema>;
