// Shown with no signal when a page hasn't been opened on this phone before
import type { Metadata } from "next";
import { EmptyState } from "@/components/kotila/empty-state";

export const metadata: Metadata = { title: "No signal · Kotila Farm" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ground p-6">
      <EmptyState title="No signal, and this page isn’t on this phone yet" icon="wifi-off" action={{ label: "Go to Today", icon: "home", href: "/today" }}>
        Today, the daily log and weights keep working with no signal once you have opened them here with signal. Entries you save now are kept on this phone.
      </EmptyState>
    </main>
  );
}
