// Report queries: which week (any day in it; empty means this week)
import { z } from "zod";
import { farmDateSchema } from "@/schemas/set";

export const weekQuerySchema = z.object({ week: farmDateSchema.optional() });
