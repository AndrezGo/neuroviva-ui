import { Home, Newspaper, Tv, Users, BookOpen } from 'lucide-react';
import { routes } from '@/core/routing/routes';
import type { PatientTab } from './PatientTabBar';
import type { LucideIcon } from 'lucide-react';

export interface PatientTabItem {
  tab: PatientTab;
  label: string;
  href: string;
  /** Lucide icon component — callers render it with their desired size/aria props */
  Icon: LucideIcon;
}

/**
 * Single source of truth for patient navigation items.
 * Used by PatientTabBar (mobile) and PatientDesktopSidebar (desktop).
 *
 * Patient has NO separate profile/account tab — sidebar and tab bar share
 * the identical 5-item array.
 */
export const patientTabItems: PatientTabItem[] = [
  {
    tab: 'home',
    label: 'Inicio',
    href: routes.patientHome(),
    Icon: Home,
  },
  {
    tab: 'news',
    label: 'Noticias',
    href: routes.patientNews(),
    Icon: Newspaper,
  },
  {
    tab: 'channels',
    label: 'Canales',
    href: routes.patientChannels(),
    Icon: Tv,
  },
  {
    tab: 'community',
    label: 'Comunidad',
    href: routes.patientCommunity(),
    Icon: Users,
  },
  {
    tab: 'articles',
    label: 'Artículos',
    href: routes.patientArticles(),
    Icon: BookOpen,
  },
];
