"use client";
// Underline tabs for switching views inside a page, with optional counts
import { Tabs as TabsRoot, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toOption } from "@/types/option";

type TabItem = string | { value: string; label: string; count?: number };

type TabsProps = { items: TabItem[]; active?: string; onChange?: (value: string) => void };

export function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <TabsRoot value={active} onValueChange={(v) => onChange?.(String(v))}>
      <TabsList variant="line" className="h-auto w-full justify-start gap-1 rounded-none border-b border-line p-0">
        {items.map((item) => {
          const opt = toOption(typeof item === "string" ? item : { value: item.value, label: item.label });
          const itemCount = typeof item === "string" ? undefined : item.count;
          return (
            <TabsTrigger
              key={opt.value}
              value={opt.value}
              className="-mb-px h-12 flex-none gap-2 rounded-none border-0 border-b-[3px] border-transparent px-4 text-[15px] leading-none font-semibold text-ink-muted after:hidden hover:text-ink focus-visible:shadow-focus focus-visible:ring-0 focus-visible:outline-none data-active:border-green-600 data-active:text-ink"
            >
              {opt.label}
              {itemCount !== undefined ? (
                <span className="rounded-full bg-surface-sunken px-2 py-px text-xs text-ink-2">{itemCount}</span>
              ) : null}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </TabsRoot>
  );
}
