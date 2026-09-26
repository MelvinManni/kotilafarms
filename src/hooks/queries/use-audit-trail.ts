// A record's edit history
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { Role } from "@/types/role";

export type AuditRow = { action: "create" | "update" | "delete" | "resolve"; field: string | null; from: unknown; to: unknown; reason: string | null; at: string; enteredOfflineAt: string | null; who: string; role: Role };

export function useAuditTrail(table: string, rowId: string) {
  return useQuery({ queryKey: qk.audit(table, rowId), queryFn: ({ signal }) => apiFetch<AuditRow[]>(`/api/audit?table=${table}&rowId=${rowId}`, { signal }) });
}
