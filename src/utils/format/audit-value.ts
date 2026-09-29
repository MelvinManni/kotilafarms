// Field names and values in the edit history, in the farm's words
import { tagLabel } from "@/constants/observation-tags";
import { naira } from "@/utils/format/naira";

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
  amount: "amount",
  total: "total",
  birds: "birds",
  pricePerBird: "price per bird",
  paidAtSale: "paid at the sale",
  deposit: "deposit",
  description: "what for",
  date: "date",
  name: "name",
  shares: "shares",
  removedAt: "register",
  givenOn: "day given",
  dueAgeDays: "due day",
  repaidOn: "repaid on",
  categoryId: "category",
  setId: "Set",
  buyerId: "buyer",
  overhead: "overhead",
  password: "password",
};

// Money fields show as naira
const MONEY = new Set(["amount", "total", "pricePerBird", "paidAtSale", "deposit", "cost", "pricePerBag", "transportCost", "unitCost", "countedCash", "bankBalance"]);

export const auditFieldLabel = (field: string) => FIELDS[field] ?? field;

export function auditValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "nothing";
  if (field === "tags" && Array.isArray(value)) return value.length ? value.map(tagLabel).join(", ") : "nothing";
  if (field === "active") return value ? "active" : "deactivated";
  if (field === "tempC") return `${value}°C`;
  if (field === "removedAt") return value ? "removed" : "on the register";
  if (MONEY.has(field) && typeof value === "number") return naira(value);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}
