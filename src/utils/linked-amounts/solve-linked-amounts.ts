// Quantity × price each = total: the two most recently typed fields set the third
export type LinkedField = "quantity" | "unitPrice" | "total";

export type LinkedAmountsState = {
  quantity: number | null;
  unitPrice: number | null;
  total: number | null;
  lastTyped: [LinkedField, LinkedField];
};

const FIELDS: LinkedField[] = ["quantity", "unitPrice", "total"];

export function calculatedField(state: LinkedAmountsState): LinkedField {
  return FIELDS.find((f) => !state.lastTyped.includes(f)) ?? "total";
}

// Money is whole naira; quantity keeps two decimals (half bags)
export function solveLinkedAmounts(
  state: LinkedAmountsState,
  field: LinkedField,
  value: number | null,
): LinkedAmountsState {
  const lastTyped: [LinkedField, LinkedField] =
    state.lastTyped[0] === field ? state.lastTyped : [field, state.lastTyped[0]];
  const next: LinkedAmountsState = { ...state, [field]: value, lastTyped };
  const { quantity: q, unitPrice: u, total: t } = next;
  const calc = calculatedField(next);
  if (calc === "total") next.total = q !== null && u !== null ? Math.round(q * u) : null;
  if (calc === "unitPrice") next.unitPrice = q && t !== null ? Math.round(t / q) : null;
  if (calc === "quantity") next.quantity = u && t !== null ? Math.round((t / u) * 100) / 100 : null;
  return next;
}

export function initialLinkedAmounts(quantity?: number, unitPrice?: number, total?: number): LinkedAmountsState {
  const q = quantity ?? null;
  const u = unitPrice ?? null;
  const t = total ?? (q !== null && u !== null ? Math.round(q * u) : null);
  return { quantity: q, unitPrice: u, total: t, lastTyped: ["quantity", "unitPrice"] };
}
