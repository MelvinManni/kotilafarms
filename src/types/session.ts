// The signed-in person as the app sees them
import type { Role } from "@/types/role";

export type SessionUser = { id: string; name: string; email: string; role: Role };
