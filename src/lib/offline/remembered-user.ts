// The last person signed in on this device, so they can open the app offline
import type { Role } from "@/types/role";

export type RememberedUser = { id: string; name: string; email: string; role: Role; lastOnlineAt: string };

const KEY = "kotila:last-user";

export function readRememberedUser(): RememberedUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RememberedUser) : null;
  } catch {
    return null;
  }
}

export function rememberUser(user: Omit<RememberedUser, "lastOnlineAt">) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...user, lastOnlineAt: new Date().toISOString() }));
  } catch {
    // Private mode or storage full: offline sign-in just won't be offered
  }
}

export function forgetUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to forget
  }
}
