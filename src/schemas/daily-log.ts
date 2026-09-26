// A day's log for one Set, shared by the entry form, the API and offline sync
import * as z from "zod/mini";
import { CAUSE_VALUES } from "@/constants/death-causes";
import { TAG_VALUES } from "@/constants/observation-tags";
import { text, whole } from "@/schemas/checks";
import { farmDateSchema } from "@/schemas/set";

const maybe = <T extends z.ZodMiniType>(schema: T) => z.optional(z.nullable(schema));

// No defaults here: an edit must only touch the fields it sends
export const dailyLogFieldsSchema = z.object({
  deaths: z.number({ error: "Enter how many died, or 0." }).check(whole(), z.gte(0, "Deaths can't be below 0.")),
  deathCause: maybe(z.enum(CAUSE_VALUES)),
  feedTypeId: maybe(z.uuid()),
  feedQty: maybe(z.number().check(z.gte(0, "Feed can't be below 0."), z.lte(1000))),
  feedUnit: z.enum(["bags", "kg"]),
  waterLevel: maybe(z.enum(["low", "normal", "high"])),
  waterLitres: maybe(z.number().check(whole(), z.gte(0))),
  tempC: maybe(z.number().check(z.gte(0), z.lte(50, "That temperature looks wrong. Check it."))),
  tags: z.array(z.enum(TAG_VALUES)),
  note: maybe(text(1000)),
});

const feedNeedsType = z.refine<{ feedQty?: number | null; feedTypeId?: string | null }>((v) => !v.feedQty || Boolean(v.feedTypeId), { message: "Choose the feed type.", path: ["feedTypeId"] });

export const dailyLogUpsertSchema = z
  .extend(dailyLogFieldsSchema, {
    feedUnit: z._default(z.enum(["bags", "kg"]), "bags"),
    tags: z._default(z.array(z.enum(TAG_VALUES)), []),
    clientId: z.uuid(),
    date: farmDateSchema,
    // Version the edit started from; left out when creating
    baseVersion: z.optional(z.number().check(whole(), z.positive())),
    reason: z.optional(text(500)),
    enteredOfflineAt: z.optional(z.iso.datetime()),
  })
  .check(feedNeedsType);

export const dailyLogEditSchema = z
  .extend(z.partial(dailyLogFieldsSchema), { baseVersion: z.number().check(whole(), z.positive()), reason: z.optional(text(500)) })
  .check(feedNeedsType);

export type DailyLogUpsertInput = z.input<typeof dailyLogUpsertSchema>;
export type DailyLogUpsert = z.output<typeof dailyLogUpsertSchema>;
export type DailyLogEdit = z.output<typeof dailyLogEditSchema>;
