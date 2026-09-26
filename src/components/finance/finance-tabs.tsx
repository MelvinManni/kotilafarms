"use client";
// Tabs across the Finance pages, showing only what this role can open
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/kotila/tabs";
import { FINANCE_TABS } from "@/constants/finance-tabs";
import type { Role } from "@/types/role";

export function FinanceTabs({ active, role }: { active: string; role: Role }) {
  const router = useRouter();
  const tabs = FINANCE_TABS.filter((t) => t.roles.includes(role));
  if (tabs.length < 2) return null;
  return (
    <div className="min-w-0 max-lg:rounded-lg max-lg:bg-surface max-lg:px-2 max-lg:shadow-raise">
      <Tabs items={tabs} active={active} onChange={(value) => router.push(tabs.find((t) => t.value === value)!.href)} />
    </div>
  );
}
