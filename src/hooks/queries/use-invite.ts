// Invite lookup and acceptance (public), and creating invites (owners)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { InviteAcceptInput, InviteCreateInput } from "@/schemas/auth";
import type { Role } from "@/types/role";

export type InviteDetails = { name: string; email: string; role: Role; invitedBy: string; isReset: boolean };
export type CreatedInvite = { token: string; path: string; expiresAt: string; isReset: boolean };

export function useInvite(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: ({ signal }) => apiFetch<InviteDetails>(`/api/invites/${token}`, { signal }),
    retry: false,
  });
}

export function useAcceptInvite() {
  return useMutation({ mutationFn: (input: InviteAcceptInput) => apiFetch<{ email: string }>("/api/invites/accept", { method: "POST", body: input }) });
}

export function useCreateInvite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteCreateInput) => apiFetch<CreatedInvite>("/api/invites", { method: "POST", body: input }),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.users() }),
  });
}
