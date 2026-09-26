// Sets side by side
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { CompareRow } from "@/types/compare";

export function useCompare(setIds: string[]) {
  return useQuery({ queryKey: qk.reports.compare(setIds), queryFn: ({ signal }) => apiFetch<CompareRow[]>(`/api/reports/compare?setIds=${setIds.join(",")}`, { signal }), enabled: setIds.length >= 2 });
}
