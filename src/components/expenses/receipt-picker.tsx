"use client";
// Take or choose a receipt photo; it uploads straight away (needs a connection)
import { useRef } from "react";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { useOnline } from "@/hooks/use-online";
import { useUploadReceipt } from "@/hooks/queries/use-expenses";

export function ReceiptPicker({ value, onChange }: { value: string | null; onChange: (key: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadReceipt();
  const online = useOnline();
  const pick = (file?: File) => file && upload.mutate(file, { onSuccess: onChange });
  if (!online && !value) return <p className="m-0 text-caption text-ink-muted">Receipt photos need a connection. Add one later from the expense.</p>;
  return (
    <div className="flex flex-col gap-2">
      <input ref={input} type="file" accept="image/*,application/pdf" capture="environment" className="hidden" aria-label="Receipt photo" onChange={(e) => pick(e.target.files?.[0])} />
      <div className="flex flex-wrap items-center gap-3">
        {value ? <a href={`/api/uploads/receipt/${value}`} target="_blank" rel="noreferrer" className="text-[15px] font-bold text-green-700">View receipt</a> : null}
        <Button icon="camera" onClick={() => input.current?.click()} disabled={upload.isPending}>
          {upload.isPending ? "Uploading…" : value ? "Replace receipt" : "Add receipt photo"}
        </Button>
        {value ? <Button variant="quiet" onClick={() => onChange(null)}>Remove</Button> : null}
      </div>
      {upload.error ? <Notice tone="alert" compact>{upload.error.message}</Notice> : null}
    </div>
  );
}
