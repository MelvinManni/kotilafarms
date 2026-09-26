"use client";
// Dev preview: glass modal and phone bottom sheet
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { Sheet } from "@/components/kotila/sheet";
import { PreviewSection } from "@/components/dev/preview-section";

export function SheetPreview({ initial = null }: { initial?: "modal" | "sheet" | null }) {
  const [open, setOpen] = useState<"modal" | "sheet" | null>(initial);
  const close = () => setOpen(null);
  return (
    <PreviewSection title="Sheets">
      <div className="flex gap-3">
        <Button onClick={() => setOpen("modal")}>Open modal</Button>
        <Button onClick={() => setOpen("sheet")}>Open bottom sheet</Button>
      </div>
      {open ? (
        <Sheet
          open
          variant={open}
          title="Record a payment"
          description="Mama Nkechi owes ₦215,000 for 30 birds sold on 7 Sep."
          onClose={close}
          footer={
            <>
              <Button onClick={close}>Cancel</Button>
              <Button variant="primary" onClick={close}>Save payment</Button>
            </>
          }
        >
          <MoneyInput label="Amount paid" required />
        </Sheet>
      ) : null}
    </PreviewSection>
  );
}
