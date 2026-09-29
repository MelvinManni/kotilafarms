// Stage of a Set as a tag: Brooding · day 6
import { Tag, type TagTone } from "@/components/kotila/tag";
import { SET_STATUS_LABEL } from "@/constants/set-status-labels";
import type { SetStatus } from "@/types/set-status";

const TONE: Record<SetStatus, TagTone> = { brooding: "warning", growing: "success", selling: "deep", closed: "closed" };

export function StatusChip({ status, day }: { status: SetStatus; day?: number }) {
  const label = SET_STATUS_LABEL[status];
  return <Tag tone={TONE[status]}>{day === undefined ? label : `${label} · day ${day}`}</Tag>;
}
