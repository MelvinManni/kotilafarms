// Sign-in attempt limit per email + IP, kept in memory (fine for one app instance)
import "server-only";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

// Record an attempt; false when this key has had too many recently
export function allowAttempt(key: string, now = Date.now()): boolean {
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length <= MAX_ATTEMPTS;
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}
