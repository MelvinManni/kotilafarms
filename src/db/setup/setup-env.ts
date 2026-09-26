// Env for `pnpm db:setup`: where the database is and who the first owner is
import * as z from "zod/mini";

const schema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/, error: "DATABASE_URL must be a postgres:// address" }),
  FIRST_OWNER_NAME: z.string({ error: "FIRST_OWNER_NAME is required" }).check(z.minLength(1)),
  FIRST_OWNER_EMAIL: z.email({ error: "FIRST_OWNER_EMAIL must be an email address" }),
  FIRST_OWNER_PASSWORD: z.string({ error: "FIRST_OWNER_PASSWORD is required" }).check(z.minLength(10, "FIRST_OWNER_PASSWORD must be at least 10 characters")),
});

export function parseSetupEnv(source: Record<string, string | undefined>) {
  const result = schema.safeParse(source);
  if (!result.success) throw new Error(`Setup settings are not valid. Fix .env:\n${z.prettifyError(result.error)}`);
  return result.data;
}
