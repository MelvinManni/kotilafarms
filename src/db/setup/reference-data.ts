// Fixed lists from the product spec that the app needs before anyone can record anything
import { DEFAULT_STANDARD_KG } from "@/constants/breed-standard";

export const STOCK_TYPES = [{ key: "broiler", name: "Broilers" }];

export const EXPENSE_CATEGORIES = [
  { key: "feed", name: "Feed", isCapitalEligible: false },
  { key: "day_olds", name: "Day-old chicks", isCapitalEligible: false },
  { key: "drugs", name: "Drugs and vaccines", isCapitalEligible: false },
  { key: "transport", name: "Transport", isCapitalEligible: false },
  { key: "brooding", name: "Brooding (charcoal, kerosene, fuel)", isCapitalEligible: false },
  { key: "litter", name: "Litter (sawdust)", isCapitalEligible: false },
  { key: "labour", name: "Labour", isCapitalEligible: false },
  { key: "processing", name: "Processing", isCapitalEligible: false },
  { key: "equipment", name: "Equipment and structures", isCapitalEligible: true },
  { key: "other", name: "Other", isCapitalEligible: false },
];

export const VACCINE_DEFAULTS = [
  { item: "Gumboro", doseNo: 1, dueAgeDays: 7, method: "Drinking water" },
  { item: "Lasota", doseNo: 1, dueAgeDays: 10, method: "Drinking water" },
  { item: "Gumboro", doseNo: 2, dueAgeDays: 14, method: "Drinking water" },
  { item: "Lasota", doseNo: 2, dueAgeDays: 21, method: "Drinking water" },
];

export const BREED_CURVE = {
  name: "Broiler standard",
  points: DEFAULT_STANDARD_KG.map((p) => ({ day: p.day, grams: Math.round(p.kg * 1000) })),
};

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  borrowingCapPct: 0.5,
  bulkRatePerBird: 7500,
  farmTimezone: "Africa/Lagos",
};
