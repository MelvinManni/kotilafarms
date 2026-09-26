// Navigation items for the side rail and phone tab bar
import type { IconName } from "@/svgs/icon-paths";
import type { Role } from "@/types/role";

export type NavItem = { id: string; label: string; icon: IconName; href: string; roles?: Role[] };

export type TabItem = { id: string; label: string; icon?: IconName; href: string; primary?: boolean };
