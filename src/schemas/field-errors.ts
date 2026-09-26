// Field name → first message, from a failed zod parse (for forms kept in plain state)
import type { z } from "zod";

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
  return errors;
}
