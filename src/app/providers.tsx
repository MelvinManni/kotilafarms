"use client";
// Client providers: React Query with its cache kept in IndexedDB (devtools in development), and the NextAuth session
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { SessionProvider } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { CACHE_BUSTER, CACHE_MAX_AGE, queryPersister } from "@/lib/query/persister";
import { makeQueryClient } from "@/lib/query/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <PersistQueryClientProvider
        client={client}
        persistOptions={{
          persister: queryPersister,
          maxAge: CACHE_MAX_AGE,
          buster: CACHE_BUSTER,
          // Invite links and edit histories aren't worth keeping offline
          dehydrateOptions: { shouldDehydrateQuery: (q) => q.state.status === "success" && !["invite", "audit"].includes(String(q.queryKey[0])) },
        }}
        // The kept cache is only a stand-in until fresh data arrives
        onSuccess={() => void client.invalidateQueries()}
      >
        {children}
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools buttonPosition="bottom-left" /> : null}
      </PersistQueryClientProvider>
    </SessionProvider>
  );
}
