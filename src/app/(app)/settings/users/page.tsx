// /settings/users — owners manage who has access
import type { Metadata } from "next";
import { UsersScreen } from "@/components/settings/users-screen";

export const metadata: Metadata = { title: "Users and roles · Kotila Farm" };

export default function UsersPage() {
  return <UsersScreen />;
}
