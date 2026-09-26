// Health: a Set's vaccines, marking a dose, treatments, and the default schedule
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { HealthRecordCreateInput, VaccineMark, VaccineSchedule } from "@/schemas/health";
import type { HealthRecordRow, ScheduleDefault, SetVaccineRow } from "@/types/health";

export function useSetVaccines(setId: string) {
  return useQuery({ queryKey: qk.sets.vaccines(setId), queryFn: ({ signal }) => apiFetch<SetVaccineRow[]>(`/api/sets/${setId}/vaccines`, { signal }) });
}

export function useMarkVaccine(setId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: VaccineMark) => apiFetch<SetVaccineRow[]>(`/api/sets/${setId}/vaccines`, { method: "PATCH", body: input }),
    onSuccess: (rows) => {
      client.setQueryData(qk.sets.vaccines(setId), rows);
      void client.invalidateQueries({ queryKey: qk.today() });
    },
  });
}

export function useHealthRecords() {
  return useQuery({ queryKey: qk.health.all(), queryFn: ({ signal }) => apiFetch<HealthRecordRow[]>("/api/health", { signal }) });
}

export function useAddHealthRecord() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: HealthRecordCreateInput) => apiFetch<{ id: string }>("/api/health", { method: "POST", body: input }),
    onSuccess: () => {
      for (const key of [["health"], ["expenses"], qk.sets.all()]) void client.invalidateQueries({ queryKey: key });
    },
  });
}

export function useVaccineSchedule() {
  return useQuery({ queryKey: qk.settings("vaccine-schedule"), queryFn: ({ signal }) => apiFetch<ScheduleDefault[]>("/api/settings/vaccine-schedule", { signal }) });
}

export function useSaveVaccineSchedule() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: VaccineSchedule) => apiFetch<ScheduleDefault[]>("/api/settings/vaccine-schedule", { method: "PATCH", body: input }),
    onSuccess: (rows) => client.setQueryData(qk.settings("vaccine-schedule"), rows),
  });
}

// Every running Set's vaccines at once, for the Health page notice
export function useRunningVaccines(setIds: string[]) {
  return useQueries({
    queries: setIds.map((id) => ({ queryKey: qk.sets.vaccines(id), queryFn: ({ signal }: { signal: AbortSignal }) => apiFetch<SetVaccineRow[]>(`/api/sets/${id}/vaccines`, { signal }) })),
  });
}
