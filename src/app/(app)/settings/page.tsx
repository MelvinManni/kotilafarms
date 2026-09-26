// /settings — open the first section this role can use
import { redirect } from "next/navigation";
import { SETTINGS_TABS } from "@/constants/settings-tabs";
import { getSessionUser } from "@/server/auth";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const first = SETTINGS_TABS.find((t) => user && t.roles.includes(user.role));
  redirect(first?.href ?? "/today");
}
