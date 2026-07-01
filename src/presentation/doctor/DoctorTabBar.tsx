'use client';

import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { doctorTabItems, doctorAccountTabItem } from './navigation';

export type DoctorTab = 'patients' | 'alerts' | 'curation' | 'profile';

interface DoctorTabBarProps {
  activeTab: DoctorTab;
  isScientificCommittee?: boolean;
}

/**
 * Fixed bottom navigation bar for the Doctor panel.
 * Renders tab items with accessible labels and active state indicators.
 * Nav data sourced from navigation.ts — shared with the desktop sidebar.
 * The 'curation' tab is hidden when isScientificCommittee is false.
 */
export function DoctorTabBar({ activeTab, isScientificCommittee = false }: DoctorTabBarProps) {
  const allTabs = [...doctorTabItems, doctorAccountTabItem];
  const visibleTabs = allTabs.filter(
    (item) => item.tab !== 'curation' || isScientificCommittee,
  );

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white z-40 overflow-x-hidden lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch px-0.5 pt-1.5 pb-2">
        {visibleTabs.map(({ tab, label, href, Icon }) => {
          const isActive = tab === activeTab;
          return (
            <li key={tab} className="flex-1 min-w-0">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5',
                  'text-[10px] leading-tight font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
                  isActive ? 'text-brand-primary' : 'text-gray-400',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
