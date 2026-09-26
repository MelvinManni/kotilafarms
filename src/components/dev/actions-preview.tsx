"use client";
// Dev preview: buttons, icon buttons, tooltips
import { Button } from "@/components/kotila/button";
import { IconButton } from "@/components/kotila/icon-button";
import { PreviewSection } from "@/components/dev/preview-section";

export function ActionsPreview() {
  return (
    <PreviewSection title="Buttons">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" icon="plus">Log today</Button>
        <Button>Export PDF</Button>
        <Button variant="outline" icon="calendar-x">Fill in Friday</Button>
        <Button variant="quiet">See all sales</Button>
        <Button variant="danger">Remove this one</Button>
        <Button variant="owed">Record a payment</Button>
        <Button disabled>Save sale</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" size="lg">Save expense</Button>
        <Button variant="primary" size="xl" full>Save today&apos;s log</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <IconButton icon="search" label="Search" />
        <IconButton icon="history" label="Edit history" />
        <IconButton icon="x" label="Close" variant="ghost" />
        <IconButton icon="chevron-left" label="Back to Sets" size="lg" />
      </div>
    </PreviewSection>
  );
}
