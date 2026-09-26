// The person last signed in on this device (null on the server and when nobody was)
import { useMemo, useSyncExternalStore } from "react";
import { readRememberedUser } from "@/lib/offline/remembered-user";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

export function useRememberedUser() {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem("kotila:last-user"), () => null);
  // Parse only when the stored text changes
  return useMemo(() => (raw ? readRememberedUser() : null), [raw]);
}
