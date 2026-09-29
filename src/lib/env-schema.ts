// Env schema and parser; pure so scripts and tests can use it
import * as z from "zod/mini";

// Empty values in .env count as "not set"
const blankToUndefined = z.transform((value: unknown) => (value === "" ? undefined : value));
const optionalText = z.pipe(blankToUndefined, z.optional(z.string()));
const optionalUrl = z.pipe(blankToUndefined, z.optional(z.url()));

const isTimeZone = (zone: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
};

export const envSchema = z
  .object({
    NODE_ENV: z._default(z.enum(["development", "test", "production"]), "development"),
    DATABASE_URL: z.url({
      protocol: /^postgres(ql)?$/,
      error: "DATABASE_URL must be a postgres:// address",
    }),
    NEXTAUTH_URL: z.url({ error: "NEXTAUTH_URL must be the app address, like http://localhost:3000" }),
    NEXTAUTH_SECRET: z.string({ error: "NEXTAUTH_SECRET is required" }).check(
      z.minLength(32, "NEXTAUTH_SECRET must be at least 32 characters. Make one with: openssl rand -base64 32"),
      z.refine<string>((value) => !value.startsWith("replace-with"), "NEXTAUTH_SECRET is still the example value"),
    ),
    S3_BUCKET: z.string({ error: "S3_BUCKET is required" }).check(z.minLength(3, "S3_BUCKET is too short")),
    S3_REGION: z.string({ error: "S3_REGION is required" }).check(z.minLength(1, "S3_REGION is required")),
    S3_ACCESS_KEY_ID: optionalText,
    S3_SECRET_ACCESS_KEY: optionalText,
    S3_ENDPOINT: optionalUrl,
    // PDF reports: Chromium to print with (the container sets it; empty uses the installed Chrome)
    CHROMIUM_PATH: optionalText,
    // Where the headless browser reaches this app (empty uses NEXTAUTH_URL)
    INTERNAL_APP_URL: optionalUrl,
    // Emails through Resend; without a key no email is sent
    RESEND_API_KEY: optionalText,
    MAIL_FROM: z._default(z.string().check(z.minLength(3)), "Kotila Farms <hello@kotilafarms.com>"),
    HOW_TO_VIDEO_URL: z._default(z.url(), "https://kotilafarms.s3.us-east-1.amazonaws.com/kotila-farm-how-to-staff.mp4"),
    FARM_TIMEZONE: z._default(z.string().check(z.refine(isTimeZone, "FARM_TIMEZONE must be a time zone name, like Africa/Lagos")), "Africa/Lagos"),
  })
  // Keys come as a pair, or not at all (then the SDK uses the machine's role)
  .check(
    z.refine<{ S3_ACCESS_KEY_ID?: string; S3_SECRET_ACCESS_KEY?: string }>((env) => Boolean(env.S3_ACCESS_KEY_ID) === Boolean(env.S3_SECRET_ACCESS_KEY), {
      message: "Set both S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY, or neither",
      path: ["S3_SECRET_ACCESS_KEY"],
    }),
  );

export type Env = z.infer<typeof envSchema>;

// Parse env or throw one readable error listing every problem
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Environment settings are not valid. Fix .env:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
