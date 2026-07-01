import { Users, Bell, BookOpen, UserCircle } from 'lucide-react';
import { routes } from '@/core/routing/routes';
import type { DoctorTab } from './DoctorTabBar';
import type { LucideIcon } from 'lucide-react';

export interface DoctorTabItem {
  tab: DoctorTab;
  label: string;
  href: string;
  /** Lucide icon component — callers render it with their desired size/aria props */
  Icon: LucideIcon;
}

/**
 * Single source of truth for doctor navigation items.
 * Used by DoctorTabBar (mobile) and DoctorDesktopSidebar (desktop).
 *
 * `doctorAccountTabItem` is kept separate so the desktop sidebar can omit it —
 * on desktop, the account / profile action lives in the header dropdown.
 */
export const doctorTabItems: DoctorTabItem[] = [
  {
    tab: 'patients',
    label: 'Pacientes',
    href: routes.homeDoctor(),
    Icon: Users,
  },
  {
    tab: 'alerts',
    label: 'Alertas',
    href: routes.doctorAlerts(),
    Icon: Bell,
  },
  {
    tab: 'curation',
    label: 'Curaduría',
    href: routes.doctorCuraduria(),
    Icon: BookOpen,
  },
];

/** Profile / account item — shown in the mobile tab bar but NOT in the desktop sidebar. */
export const doctorAccountTabItem: DoctorTabItem = {
  tab: 'profile',
  label: 'Perfil',
  href: routes.doctorProfile(),
  Icon: UserCircle,
};
