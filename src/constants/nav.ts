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
