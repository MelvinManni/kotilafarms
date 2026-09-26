// Field names and values in the edit history, in the farm's words
import { tagLabel } from "@/constants/observation-tags";

const FIELDS: Record<string, string> = {
  deaths: "deaths",
  deathCause: "cause",
  feedQty: "feed used",
  feedUnit: "feed unit",
  feedTypeId: "feed type",
  waterLevel: "water",
  waterLitres: "water (litres)",
  tempC: "temperature",
  tags: "seen in the pen",
  note: "note",
  role: "role",
  active: "access",
  status: "stage",
  closedOn: "closing day",
  deletedAt: "removed",
};

export const auditFieldLabel = (field: string) => FIELDS[field] ?? field;

export function auditValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "nothing";
  if (field === "tags" && Array.isArray(value)) return value.length ? value.map(tagLabel).join(", ") : "nothing";
  if (field === "active") return value ? "active" : "deactivated";
  if (field === "tempC") return `${value}°C`;
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}
