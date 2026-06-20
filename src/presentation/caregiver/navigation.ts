import { Home, Pill, Activity, Calendar, ClipboardList, User } from 'lucide-react';
import { routes } from '@/core/routing/routes';
import type { CaregiverTab } from './CaregiverTabBar';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  tab: CaregiverTab;
  label: string;
  href: string;
  /** Lucide icon component — callers render it with their desired size/aria props */
  Icon: LucideIcon;
}

/**
 * Single source of truth for caregiver navigation items.
 * Used by CaregiverTabBar (mobile) and CaregiverDesktopSidebar (desktop).
 *
 * `accountTabItem` is kept separate so the desktop sidebar can omit it —
 * on desktop, the account / profile action lives in the header dropdown.
 */
export const tabItems: TabItem[] = [
  {
    tab: 'home',
    label: 'Inicio',
    href: routes.caregiverHome(),
    Icon: Home,
  },
  {
    tab: 'meds',
    label: 'Medicinas',
    href: routes.caregiverMeds(),
    Icon: Pill,
  },
  {
    tab: 'symptoms',
    label: 'Síntomas',
    href: routes.caregiverSymptoms(),
    Icon: Activity,
  },
  {
    tab: 'agenda',
    label: 'Agenda',
    href: routes.caregiverAgenda(),
    Icon: Calendar,
  },
  {
    tab: 'history',
    label: 'Historia',
    href: routes.caregiverHistory(),
    Icon: ClipboardList,
  },
];

/** Profile / account item — shown in the mobile tab bar but NOT in the desktop sidebar. */
export const accountTabItem: TabItem = {
  tab: 'profile',
  label: 'Perfil',
  href: routes.caregiverProfile(),
  Icon: User,
};
