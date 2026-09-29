// Invite lookup and acceptance (public), for links sent before passwords were emailed
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import type { InviteAcceptInput } from "@/schemas/auth";
import type { Role } from "@/types/role";

export type InviteDetails = { name: string; email: string; role: Role; invitedBy: string; isReset: boolean };

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
