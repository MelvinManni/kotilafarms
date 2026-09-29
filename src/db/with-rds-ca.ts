// Point pg at Amazon's RDS certificates, so SSL to RDS works even if NODE_EXTRA_CA_CERTS is changed or missing
import { existsSync } from "node:fs";

export function withRdsCa(url: string): string {
  const caFile = process.env.RDS_CA_FILE;
  if (!caFile || !existsSync(caFile)) return url;
  const parsed = new URL(url);
  if (!parsed.hostname.endsWith(".rds.amazonaws.com") || parsed.searchParams.has("sslrootcert")) return url;
  // pg reads this file as the trusted CA and turns SSL on
  parsed.searchParams.set("sslrootcert", caFile);
  return parsed.toString();
}
