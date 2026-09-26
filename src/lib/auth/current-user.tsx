"use client";
// The signed-in person, handed down from the server layout so screens work offline (no session fetch needed)
import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/types/session";

const CurrentUser = createContext<SessionUser | null>(null);

export function CurrentUserProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  return <CurrentUser.Provider value={user}>{children}</CurrentUser.Provider>;
}

export function useCurrentUser(): SessionUser {
  const user = useContext(CurrentUser);
  if (!user) throw new Error("useCurrentUser is used outside the app frame");
  return user;
}
