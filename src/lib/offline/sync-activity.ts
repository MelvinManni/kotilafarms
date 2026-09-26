// Whether a send is happening right now in this tab, and when the last one finished
type Listener = () => void;
const listeners = new Set<Listener>();
let state = { sending: false, lastSyncedAt: null as string | null };

export const syncActivity = {
  get: () => state,
  set(patch: Partial<typeof state>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
