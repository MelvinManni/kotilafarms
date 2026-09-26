// Navigation items for the side rail and phone tab bar
import type { IconName } from "@/svgs/icon-paths";
import type { Role } from "@/types/role";

export type NavItem = { id: string; label: string; icon: IconName; href: string; roles?: Role[] };

// A tab links to a page, or (with `href` left out) is pressed to open something like a sheet
export type TabItem = { id: string; label: string; icon?: IconName; href?: string; primary?: boolean };
