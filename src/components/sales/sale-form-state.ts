// New-sale form state, and turning it into the API body (checked with the shared schema)
import { fieldErrors } from "@/schemas/field-errors";
import { saleCreateSchema, type SaleCreateInput } from "@/schemas/sale";

export type SaleFormState = {
  setId: string;
  date: string;
  buyerId: string;
  newBuyer: { name: string; phone: string };
  birds: number | null;
  pricePerBird: number | null;
  total: number | null;
  paidAtSale: number | null;
  deposit: number | null;
  method: "cash" | "transfer" | "pos";
};

export const NEW_BUYER = "new";

// Field name → first message, from the shared sale schema
export function checkSale(form: SaleFormState, clientId: string, buyerId: string): { body?: SaleCreateInput; errors: Record<string, string> } {
  const body = {
    clientId,
    setId: form.setId,
    date: form.date,
    buyerId,
    birds: form.birds ?? undefined,
    pricePerBird: form.pricePerBird ?? undefined,
    total: form.total ?? undefined,
    paidAtSale: form.paidAtSale ?? 0,
    deposit: form.deposit ?? 0,
    method: form.method,
  };
  const result = saleCreateSchema.safeParse(body);
  return result.success ? { body: result.data, errors: {} } : { errors: fieldErrors(result.error) };
}
