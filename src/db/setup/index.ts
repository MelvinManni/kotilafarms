// `pnpm db:setup`: first owner + the spec's fixed lists. No farm records are ever added here.
import { existsSync } from "node:fs";
import { runSetup } from "@/db/setup/run-setup";
import { parseSetupEnv } from "@/db/setup/setup-env";

async function main() {
  if (existsSync(".env")) process.loadEnvFile(".env");
  await runSetup(parseSetupEnv(process.env));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
