// Stage of a Set as a tag: Brooding · day 6
import { Tag, type TagTone } from "@/components/kotila/tag";
import type { SetStatus } from "@/types/set-status";

const STATUS: Record<SetStatus, [TagTone, string]> = {
  brooding: ["warning", "Brooding"],
  growing: ["success", "Growing"],
  selling: ["deep", "Selling"],
  closed: ["closed", "Closed"],
};

export function StatusChip({ status, day }: { status: SetStatus; day?: number }) {
  const [tone, label] = STATUS[status];
  return <Tag tone={tone}>{day === undefined ? label : `${label} · day ${day}`}</Tag>;
}
