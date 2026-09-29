// Activity log query: filter by person, kind and farm days; page back with `before`
import * as z from "zod/mini";
import { ACTIVITY_KINDS } from "@/constants/activity-kinds";
import { farmDateSchema } from "@/schemas/set";

const kinds = ACTIVITY_KINDS.map((k) => k.value) as [string, ...string[]];

export const activityQuerySchema = z.object({
  person: z.optional(z.uuid()),
  kind: z.optional(z.enum(kinds)),
  from: z.optional(farmDateSchema),
  to: z.optional(farmDateSchema),
  // "<time>|<id>" of the last line already shown
  before: z.optional(z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z\|[0-9a-f-]{36}$/))),
});

export type ActivityQuery = z.output<typeof activityQuerySchema>;
