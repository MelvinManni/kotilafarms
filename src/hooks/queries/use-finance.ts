// Finance: cash position, a cash count, and Set profit and loss
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { FINANCE_QUERY } from "@/lib/query/query-client";
import { qk } from "@/lib/query/query-keys";
import type { ReconciliationInput } from "@/schemas/finance";
import type { CashPayload, PnlPayload } from "@/types/finance";

export function useCash() {
  return useQuery({ ...FINANCE_QUERY, queryKey: qk.finance.cash(), queryFn: ({ signal }) => apiFetch<CashPayload>("/api/finance/cash", { signal }) });
}

export function usePnl(setIds: string[]) {
  return useQuery({ ...FINANCE_QUERY, queryKey: qk.finance.pnl(setIds), queryFn: ({ signal }) => apiFetch<PnlPayload>(`/api/finance/pnl?setIds=${setIds.join(",")}`, { signal }), enabled: setIds.length > 0 });
}

// Needs a connection: money counts are never queued on the phone
export function useReconcile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ReconciliationInput) => apiFetch("/api/finance/reconciliations", { method: "POST", body: input }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["finance"] }),
  });
}
