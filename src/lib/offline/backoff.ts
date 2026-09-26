// When to try a failed send again: 30s, 1m, 2m … up to 30 minutes, give or take 20%
const BASE_MS = 30_000;
const MAX_MS = 30 * 60_000;

export function nextAttemptAt(attempts: number, now: number, random = Math.random()): string {
  const wait = Math.min(BASE_MS * 2 ** attempts, MAX_MS);
  const jitter = wait * 0.2 * (random * 2 - 1);
  return new Date(now + wait + jitter).toISOString();
}
