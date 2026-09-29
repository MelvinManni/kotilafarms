// Expenses: list with filters, categories, add, change, remove, receipt upload
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/auth/current-user";
import { submitViaOutbox } from "@/lib/offline/submit";
import { apiFetch, ApiRequestError } from "@/lib/query/fetcher";
import { REFERENCE_STALE_MS } from "@/lib/query/query-client";
import { qk } from "@/lib/query/query-keys";
import type { ExpenseCreateInput, ExpenseEdit } from "@/schemas/expense";
import type { ExpenseCategory, ExpenseList, ExpenseRow } from "@/types/expense";

export type ExpenseFilterState = { set?: string; categoryId?: string; month?: string; show?: "all" | "sets" | "overhead" };

const query = (f: ExpenseFilterState) => new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();

export function useExpenses(filters: ExpenseFilterState) {
  return useQuery({
    queryKey: qk.expenses.all(filters),
    queryFn: ({ signal }) => apiFetch<ExpenseList>(`/api/expenses?${query(filters)}`, { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useCategories() {
  return useQuery({ queryKey: qk.categories(), queryFn: ({ signal }) => apiFetch<ExpenseCategory[]>("/api/expense-categories", { signal }), staleTime: REFERENCE_STALE_MS });
}

function useRefreshMoney() {
  const client = useQueryClient();
  return () => {
    for (const key of [["expenses"], qk.sets.all(), qk.today(), ["finance"]]) void client.invalidateQueries({ queryKey: key });
    void client.invalidateQueries({ predicate: (q) => q.queryKey[0] === "sets" });
  };
}

// New expenses go through the outbox, so they save with no signal and can never be added twice
export function useAddExpense() {
  const refresh = useRefreshMoney();
  const user = useCurrentUser();
  return useMutation({
    mutationFn: ({ clientId, ...payload }: ExpenseCreateInput) => submitViaOutbox({ type: "expense.create", clientId, userId: user.id, payload }),
    onSettled: refresh,
  });
}

export function useEditExpense() {
  const refresh = useRefreshMoney();
  return useMutation({ mutationFn: ({ id, ...input }: ExpenseEdit & { id: string }) => apiFetch<ExpenseRow>(`/api/expenses/${id}`, { method: "PATCH", body: input }), onSuccess: refresh });
}

export function useRemoveExpense() {
  const refresh = useRefreshMoney();
  return useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => apiFetch<void>(`/api/expenses/${id}`, { method: "DELETE", body: { reason } }), onSuccess: refresh });
}

// Multipart upload, so it doesn't go through apiFetch's JSON body
export function useUploadReceipt() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/uploads/receipt", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { key?: string; error?: { code: string; message: string } } | null;
      if (!res.ok || !data?.key) throw new ApiRequestError(res.status, data?.error?.code ?? "unknown", data?.error?.message ?? "The photo didn't upload. Try again.");
      return data.key;
    },
  });
}
