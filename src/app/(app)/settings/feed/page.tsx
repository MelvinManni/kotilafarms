// /settings/feed
import type { Metadata } from "next";
import { FeedTypesScreen } from "@/components/settings/feed-types-screen";

export const metadata: Metadata = { title: "Feed types · Kotila Farm" };

export default function FeedTypesPage() {
  return <FeedTypesScreen />;
}
