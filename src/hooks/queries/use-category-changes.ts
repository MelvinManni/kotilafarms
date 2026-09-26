// Add or change an expense category
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { ExpenseCategory } from "@/types/expense";

export function useSaveCategory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id?: string; name: string; isCapitalEligible: boolean }) =>
      apiFetch<ExpenseCategory>(id ? `/api/expense-categories/${id}` : "/api/expense-categories", { method: id ? "PATCH" : "POST", body }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: qk.categories() });
      void client.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
