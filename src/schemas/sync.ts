// POST /api/sync: up to 25 queued mutations from one device, plus what is still waiting there
import { z } from "zod";

export const MUTATION_TYPES = ["dailyLog.upsert", "expense.create", "weightSample.create"] as const;
export type MutationType = (typeof MUTATION_TYPES)[number];

export const MAX_BATCH = 25;

export const pendingItemSchema = z.object({ type: z.enum(MUTATION_TYPES), setId: z.uuid().nullable().optional(), date: z.string().max(10).optional() });

export const mutationSchema = z.object({
  mutationId: z.uuid(),
  clientId: z.uuid(),
  type: z.enum(MUTATION_TYPES),
  payload: z.unknown(),
  userId: z.uuid(),
  enteredOfflineAt: z.iso.datetime().optional(),
});

export const syncRequestSchema = z.object({
  deviceId: z.uuid(),
  userAgent: z.string().max(300).optional(),
  pending: z.object({ count: z.number().int().min(0), summary: z.array(pendingItemSchema).max(50) }),
  mutations: z.array(mutationSchema).max(MAX_BATCH, `Send at most ${MAX_BATCH} entries at a time.`),
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
