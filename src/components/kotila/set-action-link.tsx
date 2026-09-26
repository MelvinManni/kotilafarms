// A big green button for one Set (log today, weigh), or a quiet white one once it's done
import Link from "next/link";
import { Icon } from "@/svgs/icon";
import { cn } from "@/utils/cn";

type SetActionLinkProps = { href: string; title: string; detail: string; done?: boolean };

export function SetActionLink({ href, title, detail, done }: SetActionLinkProps) {
  return (
    <Link href={href} className={cn("flex h-19 items-center gap-3.5 rounded-lg pr-4.5 pl-5 no-underline outline-none focus-visible:shadow-focus", done ? "border border-line bg-surface text-ink" : "bg-green-600 text-white shadow-primary")}>
      <span className="flex grow flex-col gap-0.5">
        <strong className="text-[19px]">{title}</strong>
        {/* White, not green-100: green-100 on green-600 is just under 4.5:1 */}
        <span className={cn("text-sm font-medium", done ? "text-ink-muted" : "text-white")}>{detail}</span>
      </span>
      <span className={cn("flex size-11 items-center justify-center rounded-full", done ? "bg-green-50 text-green-700" : "bg-white/18")}>
        <Icon name={done ? "check" : "chevron-right"} />
      </span>
    </Link>
  );
}
