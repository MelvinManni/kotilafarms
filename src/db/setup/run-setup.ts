// First owner + the spec's fixed lists, in one transaction. No farm records are ever added here.
import { createDb } from "@/db";
import { createFirstOwner } from "@/db/setup/create-first-owner";
import { insertReferenceData } from "@/db/setup/insert-reference-data";
import type { SetupEnv } from "@/db/setup/setup-env";
import { hashPassword } from "@/server/password";

export async function runSetup(env: SetupEnv) {
  const db = createDb(env.DATABASE_URL);
  try {
    const passwordHash = await hashPassword(env.FIRST_OWNER_PASSWORD);
    const owner = await db.transaction(async (tx) => {
      const first = await createFirstOwner(tx, { name: env.FIRST_OWNER_NAME, email: env.FIRST_OWNER_EMAIL, passwordHash });
      await insertReferenceData(tx, first.id);
      return first;
    });
    console.log(owner.created ? `Made the first owner: ${env.FIRST_OWNER_EMAIL}` : "An owner already exists; left as is.");
    console.log("Reference lists are in place.");
  } finally {
    await db.$client.end();
  }
}
