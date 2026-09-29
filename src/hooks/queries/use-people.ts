// Owners add a person or reset a password; the app makes the password and emails it
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { PersonCreateInput } from "@/schemas/auth";
import type { StartingPasswordResult } from "@/types/people";

export function useAddPerson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: PersonCreateInput) => apiFetch<StartingPasswordResult>("/api/users", { method: "POST", body: input }),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.users() }),
  });
}

export function useResetPassword() {
  return useMutation({ mutationFn: (id: string) => apiFetch<StartingPasswordResult>(`/api/users/${id}/password`, { method: "POST" }) });
}
