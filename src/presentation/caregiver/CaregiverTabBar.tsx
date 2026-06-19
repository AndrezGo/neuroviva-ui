'use client';

import Link from 'next/link';
import { Home, Pill, Activity, Calendar, ClipboardList, User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { routes } from '@/core/routing/routes';

export type CaregiverTab = 'home' | 'meds' | 'symptoms' | 'agenda' | 'history' | 'profile';

interface TabItem {
  tab: CaregiverTab;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const tabItems: TabItem[] = [
  {
    tab: 'home',
    label: 'Inicio',
    href: routes.caregiverHome(),
    icon: <Home className="h-5 w-5" aria-hidden="true" />,
  },
  {
    tab: 'meds',
    label: 'Medicinas',
    href: routes.caregiverMeds(),
    icon: <Pill className="h-5 w-5" aria-hidden="true" />,
  },
  {
    tab: 'symptoms',
    label: 'Síntomas',
    href: routes.caregiverSymptoms(),
    icon: <Activity className="h-5 w-5" aria-hidden="true" />,
  },
  {
    tab: 'agenda',
    label: 'Agenda',
    href: routes.caregiverAgenda(),
    icon: <Calendar className="h-5 w-5" aria-hidden="true" />,
  },
  {
    tab: 'history',
    label: 'Historia',
    href: routes.caregiverHistory(),
    icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />,
  },
  {
    tab: 'profile',
    label: 'Perfil',
    href: routes.caregiverProfile(),
    icon: <User className="h-5 w-5" aria-hidden="true" />,
  },
];

interface CaregiverTabBarProps {
  activeTab: CaregiverTab;
}

/**
 * Fixed bottom navigation bar for the Caregiver panel.
 * Renders 6 tab items with accessible labels and active state indicators.
 */
export function CaregiverTabBar({ activeTab }: CaregiverTabBarProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-center justify-around px-1 pt-2 pb-3">
        {tabItems.map(({ tab, label, href, icon }) => {
          const isActive = tab === activeTab;
          return (
            <li key={tab}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-2 py-1',
                  'text-xs font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
                  isActive ? 'text-brand-primary' : 'text-gray-400',
                )}
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
