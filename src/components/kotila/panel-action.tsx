// Text link or button at the top right of a panel
import Link from "next/link";
import type { ActionObject } from "@/types/action";

const classes = "text-[15px] leading-5 font-bold whitespace-nowrap text-green-700 no-underline hover:text-green-800 hover:underline";

export function PanelAction({ action, onDeep }: { action: ActionObject; onDeep?: boolean }) {
  const tone = onDeep ? "text-green-300 hover:text-green-100" : "";
  if (action.href) {
    return (
      <Link href={action.href} onClick={action.onClick} className={`${classes} ${tone}`}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={`${classes} ${tone} cursor-pointer`}>
      {action.label}
    </button>
  );
}
