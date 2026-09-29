// NextAuth session and token carry the person's id and role
import type { Role } from "@/types/role";

declare module "next-auth" {
  interface Session {
    user: { id: string; name: string; email: string; role: Role; mustChangePassword?: boolean };
  }
  interface User {
    id: string;
    role: Role;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    active?: boolean;
    checkedAt?: number;
    mustChangePassword?: boolean;
  }
}
