// Pill button; one primary per view, lg on entry screens, xl for the phone's main action
import Link from "next/link";
import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
// Base UI directly, not shadcn's Button: its variants add hover text and aria-expanded colours we don't want
import { Button as ButtonBase } from "@base-ui/react/button";
import { Icon } from "@/svgs/icon";
import type { IconName } from "@/svgs/icon-paths";
import { cn } from "@/utils/cn";

export const kotilaButtonVariants = cva(
  "inline-flex h-auto min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-transparent px-5 font-sans text-[15px] leading-none font-bold whitespace-nowrap no-underline transition-[background-color,box-shadow,transform] cursor-pointer outline-none focus-visible:border-green-600 focus-visible:shadow-focus active:translate-y-px [&_svg]:shrink-0 disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-sunken disabled:text-ink-faint disabled:opacity-100 disabled:shadow-none aria-disabled:cursor-not-allowed aria-disabled:border-line aria-disabled:bg-surface-sunken aria-disabled:text-ink-faint aria-disabled:shadow-none",
  {
    variants: {
      variant: {
        primary: "bg-green-600 text-on-deep shadow-primary hover:bg-green-600-hover",
        secondary: "border-line-strong bg-surface text-ink hover:bg-surface-sunken",
        outline: "border-green-600 bg-surface text-green-700 hover:bg-green-50",
        quiet: "bg-transparent px-3 text-green-700 hover:bg-green-50",
        danger: "border-alert bg-surface text-alert hover:bg-alert-surface",
        owed: "bg-yellow-ink text-yellow-100 hover:bg-yellow-ink/90",
      },
      size: {
        md: "",
        lg: "min-h-14 px-6 text-[17px]",
        xl: "min-h-16 px-7 text-lg",
      },
      full: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "secondary", size: "md", full: false },
  },
);

export type ButtonVariant = "primary" | "secondary" | "outline" | "quiet" | "danger" | "owed";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: "md" | "lg" | "xl";
  icon?: IconName;
  full?: boolean;
  href?: string;
  // A file to save (e.g. a PDF): a plain link, not page navigation
  download?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

export function Button({ variant, size, icon, full, href, download, disabled, type = "button", onClick, className, children }: ButtonProps) {
  const classes = cn(kotilaButtonVariants({ variant, size, full }), className);
  const content = (
    <>
      {icon ? <Icon name={icon} size={size === "xl" ? 22 : 18} strokeWidth={2.4} /> : null}
      {children}
    </>
  );
  if (href && download) {
    return (
      <a href={href} download className={classes} aria-disabled={disabled || undefined} onClick={onClick}>
        {content}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled || undefined} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return (
    <ButtonBase type={type} className={classes} disabled={disabled} onClick={onClick}>
      {content}
    </ButtonBase>
  );
}
