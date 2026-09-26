// Kotila stroke icon; decorative unless a label is given
import type { CSSProperties } from "react";
import { ICON_PATHS, type IconName } from "@/svgs/icon-paths";

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export function Icon({ name, size = 20, strokeWidth = 2, color, label, className, style }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
