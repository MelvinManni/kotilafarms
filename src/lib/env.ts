// Validated server env, read once on first use
import "server-only";
import { parseEnv, type Env } from "@/lib/env-schema";

let cached: Env | undefined;

export function env(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
