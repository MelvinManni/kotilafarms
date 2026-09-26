// Which pages each role may open (the API checks again on every call)
import type { Role } from "@/types/role";

const PUBLIC = ["/sign-in", "/invite/", "/api/auth/", "/api/invites/accept", "/serwist/", "/~offline", "/manifest.webmanifest", "/icons/"];

// Longest matching prefix wins
const ACCESS: [string, Role[]][] = [
  ["/today", ["owner", "manager", "recorder"]],
  ["/log", ["owner", "manager", "recorder"]],
  ["/weigh", ["owner", "manager", "recorder"]],
  ["/sets", ["owner", "manager", "recorder"]],
  ["/feed", ["owner", "manager"]],
  ["/health", ["owner", "manager"]],
  ["/sales", ["owner", "manager"]],
  ["/expenses", ["owner", "manager"]],
  ["/finance", ["owner", "manager"]],
  ["/finance/capital", ["owner"]],
  ["/reports", ["owner", "manager"]],
  ["/print", ["owner", "manager"]],
  ["/settings", ["owner", "manager"]],
  ["/settings/users", ["owner"]],
];

export function isPublicPath(pathname: string): boolean {
  if (process.env.NODE_ENV !== "production" && pathname.startsWith("/dev/")) return true;
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p));
}

export function canOpenPath(pathname: string, role: Role): boolean {
  const match = ACCESS.filter(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)).sort((a, b) => b[0].length - a[0].length)[0];
  return match ? match[1].includes(role) : true;
}
