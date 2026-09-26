// Partner capital and loans (owners only; every change needs a connection)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { CapitalEntryCreate, LoanCreate, LoanRepay, ShareholderCreate, ShareholderUpdate } from "@/schemas/capital";
import type { CapitalPayload } from "@/types/capital";

export function useCapital() {
  return useQuery({ queryKey: qk.finance.capital(), queryFn: ({ signal }) => apiFetch<CapitalPayload>("/api/finance/capital", { signal }) });
}

// Capital and loans move cash too
function useRefresh() {
  const client = useQueryClient();
  return () => void client.invalidateQueries({ queryKey: ["finance"] });
}

export function useAddShareholder() {
  return useMutation({ mutationFn: (input: ShareholderCreate) => apiFetch("/api/finance/shareholders", { method: "POST", body: input }), onSuccess: useRefresh() });
}

export function useAddCapitalEntry() {
  return useMutation({ mutationFn: (input: CapitalEntryCreate) => apiFetch("/api/finance/capital", { method: "POST", body: input }), onSuccess: useRefresh() });
}

export function useAddLoan() {
  return useMutation({ mutationFn: (input: LoanCreate) => apiFetch("/api/finance/loans", { method: "POST", body: input }), onSuccess: useRefresh() });
}

export function useRepayLoan() {
  return useMutation({ mutationFn: ({ id, ...input }: LoanRepay & { id: string }) => apiFetch(`/api/finance/loans/${id}`, { method: "PATCH", body: input }), onSuccess: useRefresh() });
}

export function useUpdateShareholder() {
  return useMutation({ mutationFn: ({ id, ...input }: ShareholderUpdate & { id: string }) => apiFetch(`/api/finance/shareholders/${id}`, { method: "PATCH", body: input }), onSuccess: useRefresh() });
}
