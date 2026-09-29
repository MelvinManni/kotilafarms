// What an owner gets back after adding someone or resetting their password
import type { Role } from "@/types/role";

export type PersonRow = { id: string; name: string; email: string; role: Role; active: boolean; lastActiveAt: string | Date | null };

// The password comes back only when the email didn't go, so the owner can pass it on
export type StartingPasswordResult = {
  person: PersonRow;
  emailed: boolean;
  password: string | null;
  emailProblem: string | null;
  signInUrl: string;
  videoUrl: string;
};
