// /settings/breed
import type { Metadata } from "next";
import { BreedScreen } from "@/components/settings/breed-screen";

export const metadata: Metadata = { title: "Breed standard · Kotila Farm" };

export default function BreedPage() {
  return <BreedScreen />;
}
