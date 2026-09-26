// Weights: a Set's samples and breed standard, saving a sample, and the farm's breed curve
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/auth/current-user";
import { submitViaOutbox } from "@/lib/offline/submit";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { WeightSampleCreate } from "@/schemas/weight";
import type { SetWeights } from "@/types/weight";

export type BreedCurve = { id: string; name: string; points: { day: number; grams: number }[] };

export function useSetWeights(setId: string) {
  return useQuery({ queryKey: qk.sets.weights(setId), queryFn: ({ signal }) => apiFetch<SetWeights>(`/api/sets/${setId}/weights`, { signal }) });
}

// Always through the outbox, like the daily log
export function useSubmitWeights(setId: string) {
  const client = useQueryClient();
  const user = useCurrentUser();
  return useMutation({
    mutationFn: ({ clientId, ...payload }: Omit<WeightSampleCreate, "enteredOfflineAt">) => submitViaOutbox({ type: "weightSample.create", clientId, userId: user.id, payload: { setId, ...payload } }),
    onSettled: () => {
      for (const key of [qk.sets.weights(setId), qk.sets.detail(setId), qk.today()]) void client.invalidateQueries({ queryKey: key });
    },
  });
}

export function useBreedCurve() {
  return useQuery({ queryKey: qk.settings("breed-curve"), queryFn: ({ signal }) => apiFetch<BreedCurve>("/api/settings/breed-curve", { signal }) });
}

export function useSaveBreedCurve() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (points: BreedCurve["points"]) => apiFetch<BreedCurve>("/api/settings/breed-curve", { method: "PATCH", body: { points } }),
    onSuccess: (curve) => {
      client.setQueryData(qk.settings("breed-curve"), curve);
      void client.invalidateQueries({ queryKey: qk.sets.all() });
    },
  });
}
