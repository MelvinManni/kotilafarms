// The device's IndexedDB: the outbox and a small key-value store (device id, last sync)
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { OutboxItem } from "@/lib/offline/outbox-types";

interface OfflineDb extends DBSchema {
  outbox: { key: string; value: OutboxItem; indexes: { byClient: string; byUser: string } };
  meta: { key: string; value: unknown };
}

let db: Promise<IDBPDatabase<OfflineDb>> | undefined;

export function offlineDb() {
  db ??= openDB<OfflineDb>("kotila-offline", 1, {
    upgrade(d) {
      const outbox = d.createObjectStore("outbox", { keyPath: "mutationId" });
      outbox.createIndex("byClient", "clientId");
      outbox.createIndex("byUser", "userId");
      d.createObjectStore("meta");
    },
  });
  return db;
}

// Tests start each case with an empty database
export function resetOfflineDbForTests() {
  db = undefined;
}

export async function readMeta<T>(key: string): Promise<T | undefined> {
  return (await (await offlineDb()).get("meta", key)) as T | undefined;
}

export async function writeMeta(key: string, value: unknown) {
  await (await offlineDb()).put("meta", value, key);
}
