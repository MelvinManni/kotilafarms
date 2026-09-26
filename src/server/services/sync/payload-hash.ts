// SHA-256 of a payload as canonical JSON (keys sorted), so the same entry always hashes the same
import "server-only";
import { createHash } from "node:crypto";

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value as object).sort().map((k) => [k, canonical((value as Record<string, unknown>)[k])]));
  }
  return value;
}

export function payloadHash(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonical(payload) ?? null)).digest("hex");
}
