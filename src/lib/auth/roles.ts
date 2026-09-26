// Role checks usable on client and server; the UI hides, the server refuses
import type { Role } from "@/types/role";

export type { Role };

export const OWNER_MANAGER: Role[] = ["owner", "manager"];
export const EVERYONE: Role[] = ["owner", "manager", "recorder"];

export const can = {
  seeMoney: (r: Role) => r !== "recorder",
  manageOperations: (r: Role) => r === "owner" || r === "manager",
  seeCapitalAndLoans: (r: Role) => r === "owner",
  manageUsers: (r: Role) => r === "owner",
  logDaily: (r: Role) => EVERYONE.includes(r),
};

