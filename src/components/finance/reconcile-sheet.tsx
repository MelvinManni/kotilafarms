"use client";
// Record a cash count: cash in the box and the bank balance against what the books say
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { MoneyInput } from "@/components/kotila/fields/money-input";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Rows } from "@/components/kotila/rows";
import { Sheet } from "@/components/kotila/sheet";
import { useOnline } from "@/hooks/use-online";
import { useReconcile } from "@/hooks/queries/use-finance";
import { naira } from "@/utils/format/naira";
import { reconcileDifference } from "@/utils/metrics/cash-since";

export function ReconcileSheet({ expected, onClose }: { expected: number; onClose: () => void }) {
  const save = useReconcile();
  const online = useOnline();
  const [cash, setCash] = useState<number | null>(null);
  const [bank, setBank] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const ready = cash !== null && bank !== null;
  const diff = ready ? reconcileDifference(cash, bank, expected) : null;
  return (
    <Sheet title="Reconcile cash" description="What is actually there becomes the new starting point." onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" disabled={!ready || !online || save.isPending} onClick={() => save.mutate({ countedCash: cash!, bankBalance: bank!, note: note.trim() || null }, { onSuccess: onClose })}>{save.isPending ? "Saving…" : "Save the count"}</Button></>}>
      {!online ? <Notice tone="warning" icon="wifi-off" compact>Needs a connection. Cash counts are never kept on the phone.</Notice> : null}
      {save.error ? <Notice tone="alert" compact>{save.error.message}</Notice> : null}
      <MoneyInput label="Cash counted in the box" required value={cash} onChange={setCash} />
      <MoneyInput label="Bank balance" required value={bank} onChange={setBank} />
      <Rows items={[
        { label: "The books say", value: naira(expected) },
        { label: "Counted", value: ready ? naira(cash + bank) : "—" },
        { label: diff === null ? "Difference" : diff === 0 ? "It matches" : diff < 0 ? "Short" : "Over", value: diff === null ? "—" : naira(Math.abs(diff)), total: true, tone: diff ? "alert" : undefined },
      ]} />
      <TextInput label="Note" optional multiline value={note} onChange={setNote} placeholder={diff ? "Say what might explain the difference" : undefined} />
    </Sheet>
  );
}
