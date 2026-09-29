// Change your own password
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import type { PasswordChangeInput } from "@/schemas/auth";

export function useChangePassword() {
  return useMutation({ mutationFn: (input: PasswordChangeInput) => apiFetch<{ ok: true }>("/api/me/password", { method: "POST", body: input }) });
}
