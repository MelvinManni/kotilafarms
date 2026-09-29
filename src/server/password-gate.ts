// People with an app-made password may only change it until they choose their own
import { ApiError } from "@/server/errors";
import type { SessionUser } from "@/types/session";

export function passwordGate(user: SessionUser): SessionUser {
  if (user.mustChangePassword) throw new ApiError(403, "password_change_required", "Choose your own password first.");
  return user;
}
