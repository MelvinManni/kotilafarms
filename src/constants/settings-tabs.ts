// Settings sections, in order; each lists the roles that can open it
import type { Role } from "@/types/role";

export const SETTINGS_TABS: { value: string; label: string; href: string; roles: Role[] }[] = [
  { value: "users", label: "Users and roles", href: "/settings/users", roles: ["owner"] },
  { value: "activity", label: "Activity", href: "/settings/activity", roles: ["owner"] },
  { value: "breed", label: "Breed standard", href: "/settings/breed", roles: ["owner", "manager"] },
  { value: "feed", label: "Feed types", href: "/settings/feed", roles: ["owner", "manager"] },
  { value: "vaccines", label: "Vaccine schedule", href: "/settings/vaccines", roles: ["owner", "manager"] },
  { value: "categories", label: "Expense categories", href: "/settings/categories", roles: ["owner", "manager"] },
];
