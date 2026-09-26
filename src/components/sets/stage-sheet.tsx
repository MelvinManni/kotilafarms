"use client";
// Change a Set's stage; closing asks for the closing date
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Segmented } from "@/components/kotila/segmented";
import { Sheet } from "@/components/kotila/sheet";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useChangeSetStatus } from "@/hooks/queries/use-sets";
import type { SetStatus } from "@/types/set-status";
import type { SetDetail } from "@/types/sets";
import { todayInZone } from "@/utils/dates/today-in-zone";

const STAGES = [
  { value: "brooding", label: "Brooding" },
  { value: "growing", label: "Growing" },
  { value: "selling", label: "Selling" },
  { value: "closed", label: "Closed" },
];

export function StageSheet({ set, onClose }: { set: SetDetail; onClose: () => void }) {
  const [status, setStatus] = useState<SetStatus>(set.status);
  const [closedOn, setClosedOn] = useState(set.closedOn ?? todayInZone(FARM_TIMEZONE));
  const change = useChangeSetStatus(set.id);
  const save = () => change.mutate({ status, closedOn: status === "closed" ? closedOn : undefined }, { onSuccess: onClose });
  return (
    <Sheet
      title={`Set ${set.number} stage`}
      description="Stages show on Today and the Sets list. Closing a Set fixes its profit and margin."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={change.isPending || (status === set.status && (status !== "closed" || closedOn === set.closedOn))}>
            {status === "closed" && set.status !== "closed" ? "Close the Set" : "Save stage"}
          </Button>
        </>
      }
    >
      {change.error ? <Notice tone="alert" compact>{change.error.message}</Notice> : null}
      <Segmented label="Stage" options={STAGES} value={status} onChange={(v) => setStatus(v as SetStatus)} />
      {status === "closed" ? <TextInput label="Closed on" type="date" value={closedOn} onChange={setClosedOn} hint="The day the last birds left." /> : null}
    </Sheet>
  );
}
