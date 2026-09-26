// Dev-only gallery of every Kotila component with farm preview data
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionsPreview } from "@/components/dev/actions-preview";
import { ChartsPreview } from "@/components/dev/charts-preview";
import { DisplayPreview } from "@/components/dev/display-preview";
import { EntryPreview } from "@/components/dev/entry-preview";
import { FieldsPreview } from "@/components/dev/fields-preview";
import { NavigationPreview } from "@/components/dev/navigation-preview";
import { NoticesPreview } from "@/components/dev/notices-preview";
import { PeoplePreview } from "@/components/dev/people-preview";
import { SheetPreview } from "@/components/dev/sheet-preview";
import { TablePreview } from "@/components/dev/table-preview";

export const metadata: Metadata = { title: "Components · Kotila Farm" };

// ?sheet=modal or ?sheet=sheet opens a sheet on load (for screenshots)
export default async function DevComponentsPage({ searchParams }: PageProps<"/dev/components">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { sheet } = await searchParams;
  const initialSheet = sheet === "modal" || sheet === "sheet" ? sheet : null;
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-10">
      <h1 className="m-0 font-display text-display font-semibold tracking-[-0.02em]">Kotila components</h1>
      <ActionsPreview />
      <FieldsPreview />
      <EntryPreview />
      <DisplayPreview />
      <TablePreview />
      <NoticesPreview />
      <PeoplePreview />
      <NavigationPreview />
      <ChartsPreview />
      <SheetPreview initial={initialSheet} />
    </main>
  );
}
