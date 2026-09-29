// Keep the React Query cache in IndexedDB so screens show the last known data offline
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { del, get, set } from "idb-keyval";

export const queryPersister = createAsyncStoragePersister({
  storage: typeof window === "undefined" ? undefined : { getItem: (k) => get<string>(k).then((v) => v ?? null), setItem: (k, v) => set(k, v), removeItem: (k) => del(k) },
  key: "kotila-query-cache",
  throttleTime: 2_000,
});

// Bump when cached shapes change, so an old cache is thrown away
export const CACHE_BUSTER = "2026-09-29";
export const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
