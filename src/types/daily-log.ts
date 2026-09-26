// A daily log as the API returns it, with who entered it and what was changed since
import type { Role } from "@/types/role";

export type LogEdit = { field: string; from: unknown; to: unknown; by: string; at: string; reason: string | null };

export type DailyLogRow = {
  id: string;
  clientId: string;
  version: number;
  setId: string;
  date: string;
  dayOfAge: number;
  deaths: number;
  deathCause: string | null;
  feedTypeId: string | null;
  feedTypeName: string | null;
  feedQty: number | null;
  feedUnit: "bags" | "kg";
  waterLevel: "low" | "normal" | "high" | null;
  waterLitres: number | null;
  tempC: number | null;
  tags: string[];
  note: string | null;
  createdBy: { id: string; name: string; role: Role };
  createdAt: string;
  enteredOfflineAt: string | null;
  edits: LogEdit[];
};
