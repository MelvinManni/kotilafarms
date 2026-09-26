// Env schema and parser; pure so scripts and tests can use it
import { z } from "zod";

// Empty values in .env count as "not set"
const optionalText = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);

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
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.url({
      protocol: /^postgres(ql)?$/,
      error: "DATABASE_URL must be a postgres:// address",
    }),
    NEXTAUTH_URL: z.url({ error: "NEXTAUTH_URL must be the app address, like http://localhost:3000" }),
    NEXTAUTH_SECRET: z
      .string({ error: "NEXTAUTH_SECRET is required" })
      .min(32, "NEXTAUTH_SECRET must be at least 32 characters. Make one with: openssl rand -base64 32")
      .refine((value) => !value.startsWith("replace-with"), "NEXTAUTH_SECRET is still the example value"),
    S3_BUCKET: z.string({ error: "S3_BUCKET is required" }).min(3, "S3_BUCKET is too short"),
    S3_REGION: z.string({ error: "S3_REGION is required" }).min(1, "S3_REGION is required"),
    S3_ACCESS_KEY_ID: optionalText,
    S3_SECRET_ACCESS_KEY: optionalText,
    S3_ENDPOINT: optionalUrl,
    // PDF reports: Chromium to print with (the container sets it; empty uses the installed Chrome)
    CHROMIUM_PATH: optionalText,
    // Where the headless browser reaches this app (empty uses NEXTAUTH_URL)
    INTERNAL_APP_URL: optionalUrl,
    FARM_TIMEZONE: z
      .string()
      .default("Africa/Lagos")
      .refine(isTimeZone, "FARM_TIMEZONE must be a time zone name, like Africa/Lagos"),
  })
  // Keys come as a pair, or not at all (then the SDK uses the machine's role)
  .refine((env) => Boolean(env.S3_ACCESS_KEY_ID) === Boolean(env.S3_SECRET_ACCESS_KEY), {
    message: "Set both S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY, or neither",
    path: ["S3_SECRET_ACCESS_KEY"],
  });

export type Env = z.infer<typeof envSchema>;

// Parse env or throw one readable error listing every problem
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Environment settings are not valid. Fix .env:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
