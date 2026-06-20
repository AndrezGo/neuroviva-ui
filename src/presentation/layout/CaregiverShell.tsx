'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useSignOut } from '@/application/auth/useSignOut';
import { getFirstName } from '@/shared/lib/greeting';
import { CaregiverDesktopSidebar } from './CaregiverDesktopSidebar';
import { CaregiverDesktopHeader } from './CaregiverDesktopHeader';
import type { CaregiverTab } from '@/presentation/caregiver/CaregiverTabBar';

interface CaregiverShellProps {
  activeTab: CaregiverTab;
  children: React.ReactNode;
}

/**
 * Orchestrates mobile vs desktop layout for the Caregiver section.
 *
 * Mobile (< lg):  renders a centered max-w-md column (white) on a slate-100
 *                 background — matching the old MobileShell behaviour.
 *                 CaregiverTabBar is already composed inside each screen.
 *
 * Desktop (≥ lg): gradient sidebar (fixed 240 px) + fixed top header + a
 *                 full-width scrollable content area offset by the chrome.
 *                 The mobile tab-bar / header chrome is hidden via lg:hidden
 *                 inside each screen component.
 */
export function CaregiverShell({ activeTab, children }: CaregiverShellProps) {
  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const firstName = getFirstName(backendUser?.name ?? user?.fullName);
  const email = backendUser?.email ?? user?.email ?? '';

  const { signOut, isLoading: isSigningOut } = useSignOut();

  const handleBellClick = useCallback(() => {
    // Notifications panel — stub for now
  }, []);

  return (
    <>
      {/* Desktop chrome — hidden on mobile via internal lg:flex / lg:block */}
      <CaregiverDesktopSidebar activeTab={activeTab} />
      <CaregiverDesktopHeader
        firstName={firstName}
        email={email}
        onSignOut={signOut}
        isSigningOut={isSigningOut}
        onBellClick={handleBellClick}
      />

      {/* Outer background layer */}
      <div className="min-h-dvh w-full overflow-x-hidden bg-slate-100 lg:bg-transparent">
        {/* Mobile: max-w-md column. Desktop: full-width offsetting sidebar+header */}
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white lg:max-w-none lg:mx-0 lg:ml-60 lg:bg-gray-50 lg:pt-16">
          {children}
        </div>
      </div>
    </>
  );
}
