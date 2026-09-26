// One id per browser, kept in IndexedDB, so the server knows which phone an entry came from
import { readMeta, writeMeta } from "@/lib/offline/idb";

export async function deviceId(): Promise<string> {
  const known = await readMeta<string>("deviceId");
  if (known) return known;
  const id = crypto.randomUUID();
  await writeMeta("deviceId", id);
  return id;
}
