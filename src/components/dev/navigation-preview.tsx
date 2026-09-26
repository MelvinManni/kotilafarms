"use client";
// Dev preview: side rail, top bar, tab bar, tabs
import { useState } from "react";
import { SideRail } from "@/components/layout/side-rail";
import { TabBar } from "@/components/layout/tab-bar";
import { TopBar } from "@/components/layout/top-bar";
import { Tabs } from "@/components/kotila/tabs";
import { RAIL_NAV, RECORDER_TABS } from "@/constants/nav";
import { PreviewSection } from "@/components/dev/preview-section";

export function NavigationPreview() {
  const [tab, setTab] = useState("overview");
  return (
    <PreviewSection title="Navigation">
      <div className="flex flex-wrap gap-6">
        <div className="h-230 overflow-hidden rounded-xl border border-line">
          <SideRail items={RAIL_NAV} active="today" badges={{ sales: { count: 3, title: "3 buyers owe money" } }} user={{ name: "Kosi", role: "owner" }} sync={{ state: "synced", lastSynced: "2 min ago" }} />
        </div>
        <div className="flex w-97.5 flex-col gap-4 rounded-xl bg-green-700 p-4">
          <TopBar title="Set 4 · day 24" sync={{ state: "offline", pending: 3 }} user={{ name: "Chinedu Okafor", role: "recorder" }} />
          <TopBar title="Daily log" back={{ label: "Back to Today", href: "#" }} />
          <div className="grow" />
          <TabBar items={RECORDER_TABS} active="log" />
          <TabBar items={[...RECORDER_TABS.slice(0, 2), { id: "add", label: "Add expense", href: "#", primary: true }, ...RECORDER_TABS.slice(2)]} active="today" />
        </div>
      </div>
      <Tabs items={[{ value: "overview", label: "Overview" }, { value: "logs", label: "Daily logs", count: 24 }, { value: "weights", label: "Weights", count: 4 }, "Money"]} active={tab} onChange={setTab} />
    </PreviewSection>
  );
}
