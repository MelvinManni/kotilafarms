// False during server render and before hydration; true once React runs in the browser
import { useSyncExternalStore } from "react";

const noop = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
