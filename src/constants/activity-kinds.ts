// Activity log filters: which tables each kind covers, and what a record is called when nothing better is known
export const ACTIVITY_KINDS = [
  { value: "logs", label: "Daily logs", tables: ["daily_logs"] },
  { value: "weights", label: "Weights", tables: ["weight_samples"] },
  { value: "sales", label: "Sales and buyers", tables: ["sales", "sale_payments", "other_sales", "buyers"] },
  { value: "expenses", label: "Expenses", tables: ["expenses", "expense_categories"] },
  { value: "feed", label: "Feed", tables: ["feed_purchases", "ingredient_purchases", "feed_types"] },
  { value: "health", label: "Health", tables: ["health_records", "set_vaccines", "vaccine_schedule_defaults"] },
  { value: "money", label: "Money and shareholders", tables: ["shareholders", "capital_entries", "loans", "cash_reconciliations"] },
  { value: "sets", label: "Sets", tables: ["sets"] },
  { value: "people", label: "People and settings", tables: ["users", "breed_curves"] },
  { value: "sign_ins", label: "Sign-ins", tables: [] },
] as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[number]["value"];

export const TABLE_NOUN: Record<string, string> = {
  daily_logs: "a daily log",
  weight_samples: "a weight sample",
  sales: "a sale",
  sale_payments: "a payment",
  other_sales: "a manure sale",
  buyers: "a buyer",
  expenses: "an expense",
  expense_categories: "an expense category",
  feed_purchases: "a feed purchase",
  ingredient_purchases: "an ingredient purchase",
  feed_types: "a feed type",
  health_records: "a treatment",
  set_vaccines: "a vaccine dose",
  vaccine_schedule_defaults: "the default vaccine schedule",
  shareholders: "a shareholder",
  capital_entries: "a capital entry",
  loans: "a loan",
  cash_reconciliations: "a cash count",
  sets: "a Set",
  users: "a person",
  breed_curves: "the breed standard",
};

export function kindOfTable(table: string): ActivityKind | null {
  return ACTIVITY_KINDS.find((k) => (k.tables as readonly string[]).includes(table))?.value ?? null;
}
