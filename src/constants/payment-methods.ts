// How buyers pay
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "Bank transfer" },
  { value: "pos", label: "POS" },
] as const;

export const methodLabel = (m: string) => PAYMENT_METHODS.find((p) => p.value === m)?.label ?? m;
