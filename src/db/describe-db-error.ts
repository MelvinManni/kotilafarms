// Readable database error: Drizzle's message plus the real reason from Postgres
// Drizzle wraps the real reason (e.g. a wrong password) in `cause`
export function describeDbError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const text = error.cause instanceof Error ? `${error.message}\n${error.cause.message}` : error.message;
  // RDS refuses connections without SSL
  return text.includes("no encryption") ? `${text}\nAdd ?sslmode=verify-full to the end of DATABASE_URL.` : text;
}
