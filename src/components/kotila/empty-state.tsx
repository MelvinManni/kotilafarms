// What an empty section is for, and the one action that fills it
import type { ReactNode } from "react";
import { Button } from "@/components/kotila/button";
import { Icon } from "@/svgs/icon";
import type { IconName } from "@/svgs/icon-paths";
import { isActionObject, type ActionObject, type ActionProp } from "@/types/action";

type EmptyStateProps = {
  title: string;
  icon?: IconName;
  action?: ActionProp<ActionObject & { icon?: IconName }>;
  children?: ReactNode;
};

export function EmptyState({ title, icon = "note", action, children }: EmptyStateProps) {
  const actionNode = isActionObject(action) ? (
    <Button variant="primary" icon={action.icon ?? "plus"} href={action.href} onClick={action.onClick}>
      {action.label}
    </Button>
  ) : (
    action
  );
  return (
    <div className="flex max-w-140 flex-col items-start gap-3 rounded-xl border-[1.5px] border-dashed border-line-strong bg-surface p-8">
      <span className="flex size-12 items-center justify-center rounded-md bg-green-50 text-green-700">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="m-0 font-display text-title font-semibold text-ink">{title}</h3>
      {children ? <p className="m-0 max-w-115 text-body text-ink-2">{children}</p> : null}
      {actionNode}
    </div>
  );
}
