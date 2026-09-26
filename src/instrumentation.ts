// Runs once when the server starts: fail fast on bad env
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { env } = await import("@/lib/env");
  env();
}
