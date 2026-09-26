"use client";
// Tabs across the Settings pages, showing only the sections this role can open
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/kotila/tabs";
import { SETTINGS_TABS } from "@/constants/settings-tabs";
import type { Role } from "@/types/role";

export function SettingsTabs({ active, role, counts = {} }: { active: string; role: Role; counts?: Record<string, number> }) {
  const router = useRouter();
  const tabs = SETTINGS_TABS.filter((t) => t.roles.includes(role));
  // On phones the tabs sit on a white strip so they read over the green band
  return (
    <div className="max-lg:rounded-lg max-lg:bg-surface max-lg:px-2 max-lg:shadow-raise">
      <Tabs
      items={tabs.map((t) => ({ value: t.value, label: t.label, count: counts[t.value] }))}
      active={active}
        onChange={(value) => router.push(tabs.find((t) => t.value === value)!.href)}
      />
    </div>
  );
}
