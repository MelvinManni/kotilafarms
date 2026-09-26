// Report queries: which week (any day in it; empty means this week)
import * as z from "zod/mini";
import { farmDateSchema } from "@/schemas/set";

export const weekQuerySchema = z.object({ week: z.optional(farmDateSchema) });
