// /feed — stock, run-out, price per bag and purchases
import type { Metadata } from "next";
import { FeedScreen } from "@/components/feed/feed-screen";

export const metadata: Metadata = { title: "Feed · Kotila Farm" };

export default function FeedPage() {
  return <FeedScreen />;
}
