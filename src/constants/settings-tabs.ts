// Settings sections, in order; each lists the roles that can open it
import type { Role } from "@/types/role";

export const SETTINGS_TABS: { value: string; label: string; href: string; roles: Role[] }[] = [
  { value: "users", label: "Users and roles", href: "/settings/users", roles: ["owner"] },
];
