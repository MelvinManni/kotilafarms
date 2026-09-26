// POST /api/sync: up to 25 queued mutations from one device, plus what is still waiting there
import * as z from "zod/mini";
import { whole } from "@/schemas/checks";

export const MUTATION_TYPES = ["dailyLog.upsert", "expense.create", "weightSample.create"] as const;
export type MutationType = (typeof MUTATION_TYPES)[number];

export const MAX_BATCH = 25;

export const pendingItemSchema = z.object({ type: z.enum(MUTATION_TYPES), setId: z.optional(z.nullable(z.uuid())), date: z.optional(z.string().check(z.maxLength(10))) });

export const mutationSchema = z.object({
  mutationId: z.uuid(),
  clientId: z.uuid(),
  type: z.enum(MUTATION_TYPES),
  payload: z.unknown(),
  userId: z.uuid(),
  enteredOfflineAt: z.optional(z.iso.datetime()),
});

export const syncRequestSchema = z.object({
  deviceId: z.uuid(),
  userAgent: z.optional(z.string().check(z.maxLength(300))),
  pending: z.object({ count: z.number().check(whole(), z.gte(0)), summary: z.array(pendingItemSchema).check(z.maxLength(50)) }),
  mutations: z.array(mutationSchema).check(z.maxLength(MAX_BATCH, `Send at most ${MAX_BATCH} entries at a time.`)),
});

export type SyncMutation = z.infer<typeof mutationSchema>;
export type SyncRequest = z.infer<typeof syncRequestSchema>;

// "retry": the server hit a problem it may not hit next time; the phone tries again later
export type SyncStatus = "applied" | "duplicate" | "conflict" | "rejected" | "retry";

export type SyncResult = {
  mutationId: string;
  status: SyncStatus;
  id?: string;
  version?: number;
  conflictId?: string;
  possibleDuplicateOf?: string | null;
  error?: { code: string; message: string };
};
