// Finance sections; capital and loans are for owners
import type { Role } from "@/types/role";

export const FINANCE_TABS: { value: string; label: string; href: string; roles: Role[] }[] = [
  { value: "cash", label: "Cash and profit", href: "/finance", roles: ["owner", "manager"] },
  { value: "capital", label: "Capital and loans", href: "/finance/capital", roles: ["owner"] },
];
