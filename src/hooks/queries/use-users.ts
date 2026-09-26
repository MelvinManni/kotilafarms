// People with access (owners only)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { UserUpdateInput } from "@/schemas/auth";
import type { Role } from "@/types/role";

export type UserRow = { id: string; name: string; email: string; role: Role; active: boolean; lastActiveAt: string | null };

export function useUsers() {
  return useQuery({ queryKey: qk.users(), queryFn: ({ signal }) => apiFetch<UserRow[]>("/api/users", { signal }) });
}

export function useUpdateUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UserUpdateInput & { id: string }) => apiFetch<UserRow>(`/api/users/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.users() }),
  });
}
