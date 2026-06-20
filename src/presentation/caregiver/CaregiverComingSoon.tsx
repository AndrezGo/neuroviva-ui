'use client';

import { CaregiverTabBar } from './CaregiverTabBar';
import type { CaregiverTab } from './CaregiverTabBar';

interface CaregiverComingSoonProps {
  title: string;
  activeTab: CaregiverTab;
}

/**
 * Placeholder screen for caregiver tab routes that are not yet implemented.
 */
export function CaregiverComingSoon({ title, activeTab }: CaregiverComingSoonProps) {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center px-6 lg:px-10 pt-10 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 text-center lg:max-w-4xl lg:mx-auto lg:w-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary">
          <span className="text-2xl" aria-hidden="true">🔧</span>
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-brand-dark">{title}</h1>
        <p className="mt-2 max-w-xs text-base leading-relaxed text-gray-text">
          Esta sección estará disponible muy pronto.
        </p>
        <p className="mt-8 rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-text">
          Próximamente: {title.toLowerCase()}
        </p>
      </main>

      <CaregiverTabBar activeTab={activeTab} />
    </>
  );
}
