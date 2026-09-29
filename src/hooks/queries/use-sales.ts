// Sales, outstanding balances, buyers, payments and manure
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { BuyerCreate, OtherSaleCreate, PaymentCreate, SaleCreateInput, SaleEdit } from "@/schemas/sale";
import type { BuyerRow, Outstanding, SaleRow, SalesList } from "@/types/sale";

export function useSales(filters: { setId?: string } = {}) {
  const q = filters.setId ? `?setId=${filters.setId}` : "";
  return useQuery({ queryKey: qk.sales.all(filters), queryFn: ({ signal }) => apiFetch<SalesList>(`/api/sales${q}`, { signal }) });
}

export function useOutstanding(enabled = true) {
  return useQuery({ queryKey: qk.sales.outstanding(), queryFn: ({ signal }) => apiFetch<Outstanding>("/api/sales/outstanding", { signal }), enabled });
}

export function useBuyers() {
  return useQuery({ queryKey: qk.buyers.all(), queryFn: ({ signal }) => apiFetch<BuyerRow[]>("/api/buyers", { signal }) });
}

export function useBuyer(id: string) {
  return useQuery({ queryKey: qk.buyers.detail(id), queryFn: ({ signal }) => apiFetch<{ buyer: BuyerRow; sales: SaleRow[]; bulkRate: number | null }>(`/api/buyers/${id}`, { signal }) });
}

// Sales change balances, Set revenue, Today and the cash position
function useRefreshSales() {
  const client = useQueryClient();
  return () => {
    for (const key of [["sales"], ["buyers"], qk.sets.all(), qk.today(), ["finance"]]) void client.invalidateQueries({ queryKey: key });
    void client.invalidateQueries({ predicate: (q) => q.queryKey[0] === "sets" });
  };
}

export function useAddSale() {
  const refresh = useRefreshSales();
  return useMutation({ mutationFn: (input: SaleCreateInput) => apiFetch<SaleRow>("/api/sales", { method: "POST", body: input }), onSuccess: refresh });
}

export function useEditSale() {
  const refresh = useRefreshSales();
  return useMutation({ mutationFn: ({ id, ...input }: SaleEdit & { id: string }) => apiFetch<SaleRow>(`/api/sales/${id}`, { method: "PATCH", body: input }), onSuccess: refresh });
}

export function useAddPayment() {
  const refresh = useRefreshSales();
  return useMutation({ mutationFn: ({ saleId, ...input }: PaymentCreate & { saleId: string }) => apiFetch<SaleRow>(`/api/sales/${saleId}/payments`, { method: "POST", body: input }), onSuccess: refresh });
}

export function useAddBuyer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: BuyerCreate) => apiFetch<{ id: string; name: string }>("/api/buyers", { method: "POST", body: input }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["buyers"] }),
  });
}

export function useAddManure() {
  const refresh = useRefreshSales();
  return useMutation({ mutationFn: (input: OtherSaleCreate) => apiFetch<unknown>("/api/other-sales", { method: "POST", body: input }), onSuccess: refresh });
}
