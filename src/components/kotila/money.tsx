// Naira amount as text: ₦ with separators, true minus for money out
import { naira } from "@/utils/format/naira";

export function Money({ value, sign }: { value: number; sign?: boolean }) {
  return <span className="tabular-nums">{naira(value, { sign })}</span>;
}
