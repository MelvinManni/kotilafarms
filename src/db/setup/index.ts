// `pnpm db:setup`: first owner + the spec's fixed lists. No farm records are ever added here.
import { existsSync } from "node:fs";
import { createDb } from "@/db";
import { createFirstOwner } from "@/db/setup/create-first-owner";
import { insertReferenceData } from "@/db/setup/insert-reference-data";
import { parseSetupEnv } from "@/db/setup/setup-env";
import { hashPassword } from "@/server/password";

async function main() {
  if (existsSync(".env")) process.loadEnvFile(".env");
  const env = parseSetupEnv(process.env);
  const db = createDb(env.DATABASE_URL);
  const passwordHash = await hashPassword(env.FIRST_OWNER_PASSWORD);
  const owner = await db.transaction(async (tx) => {
    const first = await createFirstOwner(tx, { name: env.FIRST_OWNER_NAME, email: env.FIRST_OWNER_EMAIL, passwordHash });
    await insertReferenceData(tx, first.id);
    return first;
  });
  console.log(owner.created ? `Made the first owner: ${env.FIRST_OWNER_EMAIL}` : "An owner already exists; left as is.");
  console.log("Reference lists are in place.");
  await db.$client.end();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
