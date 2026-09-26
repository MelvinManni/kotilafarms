// /settings/categories
import type { Metadata } from "next";
import { CategoriesScreen } from "@/components/settings/categories-screen";

export const metadata: Metadata = { title: "Expense categories · Kotila Farm" };

export default function CategoriesPage() {
  return <CategoriesScreen />;
}
