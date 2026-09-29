// The signed-in person as the app sees them
import type { Role } from "@/types/role";

// mustChangePassword: the app made the password, so only the password change is allowed
export type SessionUser = { id: string; name: string; email: string; role: Role; mustChangePassword?: boolean };
