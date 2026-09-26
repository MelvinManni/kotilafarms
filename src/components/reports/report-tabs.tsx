"use client";
// Tabs across the Reports pages
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/kotila/tabs";
import { REPORT_TABS } from "@/constants/report-tabs";

export function ReportTabs({ active }: { active: string }) {
  const router = useRouter();
  return (
    <div className="min-w-0 max-lg:rounded-lg max-lg:bg-surface max-lg:px-2 max-lg:shadow-raise">
      <Tabs items={REPORT_TABS} active={active} onChange={(value) => router.push(REPORT_TABS.find((t) => t.value === value)!.href)} />
    </div>
  );
}
