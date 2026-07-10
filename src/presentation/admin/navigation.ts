import { FileText, Users } from 'lucide-react';
import { routes } from '@/core/routing/routes';
import type { AdminTab } from './AdminTabBar';
import type { LucideIcon } from 'lucide-react';

export interface AdminTabItem {
  tab: AdminTab;
  label: string;
  href: string;
  /** Lucide icon component — callers render it with their desired size/aria props */
  Icon: LucideIcon;
}

/**
 * Single source of truth for admin navigation items.
 * Used by AdminTabBar (mobile) and AdminDesktopSidebar (desktop).
 * No separate account tab — the account action lives in the desktop header dropdown only.
 */
export const adminTabItems: AdminTabItem[] = [
  {
    tab: 'content',
    label: 'Contenido',
    href: routes.homeAdmin(),
    Icon: FileText,
  },
  {
    tab: 'community',
    label: 'Comunidad',
    href: routes.adminCommunity(),
    Icon: Users,
  },
];
