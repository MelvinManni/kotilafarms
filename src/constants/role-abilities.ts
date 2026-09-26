// What each role can and can't do, in the farm's words (invite screen and Settings)
import type { Role } from "@/types/role";

export const ROLE_ABILITIES: Record<Role, { can: string[]; cannot: string[] }> = {
  owner: { can: ["Everything, including partner capital, loans and who has access"], cannot: [] },
  manager: {
    can: ["Sets, daily logs, feed, weights, sales and expenses", "Cash position and Set profit"],
    cannot: ["Partner capital, shareholder loans and settlement"],
  },
  recorder: {
    can: ["Daily logs and weights, from the phone"],
    cannot: ["Money: sales, expenses, cash and profit"],
  },
};

// The access table on Settings › Users and roles
export const ROLE_MATRIX: { area: string; sub?: string; owner: string; manager: string; recorder: string }[] = [
  { area: "Today", owner: "✓", manager: "✓ no capital", recorder: "✓ no money" },
  { area: "Daily log, weights", owner: "✓", manager: "✓", recorder: "✓" },
  { area: "Sets list and detail", owner: "✓", manager: "✓", recorder: "✓ counts only" },
  { area: "Feed, health, sales", sub: "buyers, expenses", owner: "✓", manager: "✓", recorder: "—" },
  { area: "Cash position, Set P&L", owner: "✓", manager: "✓", recorder: "—" },
  { area: "Partner capital", sub: "loans, settlement", owner: "✓", manager: "—", recorder: "—" },
  { area: "Reports", owner: "✓", manager: "✓ no capital", recorder: "—" },
  { area: "Users and roles", owner: "✓", manager: "—", recorder: "—" },
  { area: "Other settings", sub: "feed, categories, buyers, vaccines, breed", owner: "✓", manager: "✓", recorder: "—" },
];
