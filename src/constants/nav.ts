// Main navigation: desktop rail for owners and managers, phone tabs for recorders
import type { NavItem, TabItem } from "@/types/nav";

export const RAIL_NAV: NavItem[] = [
  { id: "today", label: "Today", icon: "home", href: "/today" },
  { id: "sets", label: "Sets", icon: "sets", href: "/sets" },
  { id: "log", label: "Daily log", icon: "log", href: "/log" },
  { id: "feed", label: "Feed", icon: "feed", href: "/feed", roles: ["owner", "manager"] },
  { id: "weights", label: "Weights", icon: "weight", href: "/weigh" },
  { id: "health", label: "Health", icon: "health", href: "/health", roles: ["owner", "manager"] },
  { id: "sales", label: "Sales", icon: "sales", href: "/sales", roles: ["owner", "manager"] },
  { id: "expenses", label: "Expenses", icon: "expenses", href: "/expenses", roles: ["owner", "manager"] },
  { id: "finance", label: "Finance", icon: "finance", href: "/finance", roles: ["owner", "manager"] },
  { id: "reports", label: "Reports", icon: "reports", href: "/reports", roles: ["owner", "manager"] },
];

export const RECORDER_TABS: TabItem[] = [
  { id: "today", label: "Today", icon: "home", href: "/today" },
  { id: "log", label: "Log", icon: "log", href: "/log" },
  { id: "weigh", label: "Weigh", icon: "weight", href: "/weigh" },
  { id: "history", label: "History", icon: "clock", href: "/log/history" },
];

// Owners and managers on a phone: the rest of the nav sits under More
export const MANAGER_TABS: TabItem[] = [
  { id: "today", label: "Today", icon: "home", href: "/today" },
  { id: "sets", label: "Sets", icon: "sets", href: "/sets" },
  { id: "add", label: "Add an expense", icon: "plus", href: "/expenses?add=1", primary: true },
  { id: "sales", label: "Sales", icon: "sales", href: "/sales" },
  { id: "more", label: "More", icon: "more" },
];

// Which nav item a path belongs to (longest prefix wins)
export function activeNavId(pathname: string): string | undefined {
  const all = [...RAIL_NAV.map((n) => [n.id, n.href]), ["settings", "/settings"], ["history", "/log/history"]] as [string, string][];
  return all.filter(([, href]) => pathname === href || pathname.startsWith(`${href}/`)).sort((a, b) => b[1].length - a[1].length)[0]?.[0];
}
