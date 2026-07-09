'use client';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { useSignOut } from '@/application/auth/useSignOut';
import { getFirstName, getGreeting } from '@/shared/lib/greeting';
import { PatientTabBar } from '@/presentation/patient/PatientTabBar';
import { PatientDesktopSidebar } from './PatientDesktopSidebar';
import { PatientDesktopHeader } from './PatientDesktopHeader';
import type { PatientTab } from '@/presentation/patient/PatientTabBar';

interface PatientShellProps {
  children: React.ReactNode;
  activeTab: PatientTab;
}

/**
 * Orchestrates mobile vs desktop layout for the Patient section.
 *
 * Mobile (< lg):  renders a centered max-w-md column (white) on a slate-100
 *                 background — matching the caregiver/doctor shell behaviour.
 *                 Includes a greeting header and sign-out button.
 *                 PatientTabBar appears fixed at the bottom.
 *
 * Desktop (≥ lg): gradient sidebar (fixed 240 px) + fixed top header + a
 *                 full-width scrollable content area offset by the chrome.
 *                 The mobile greeting header and tab bar hide themselves on desktop.
 *
 * No notifications hook — patients have no notifications system.
 */
export function PatientShell({ children, activeTab }: PatientShellProps) {
  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const firstName = getFirstName(backendUser?.name ?? user?.fullName);
  const email = backendUser?.email ?? user?.email ?? '';
  const greeting = getGreeting();

  const { signOut, isLoading: isSigningOut } = useSignOut();

  return (
    <>
      {/* Desktop chrome — hidden on mobile via internal lg:flex / lg:block */}
      <PatientDesktopSidebar activeTab={activeTab} />
      <PatientDesktopHeader
        firstName={firstName}
        email={email}
        onSignOut={signOut}
        isSigningOut={isSigningOut}
      />

      {/* Outer background layer */}
      <div className="min-h-dvh w-full overflow-x-hidden bg-slate-100 lg:bg-transparent">
        {/* Mobile: max-w-md column. Desktop: full-width offsetting sidebar+header */}
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white md:shadow-[0_0_48px_0_rgb(0_0_0_/_0.12)] lg:max-w-none lg:mx-0 lg:ml-60 lg:w-[calc(100%-15rem)] lg:bg-gray-50 lg:pt-16 lg:shadow-none">
          {/* Mobile greeting header — hidden on desktop (desktop header owns account/sign-out) */}
          <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100 lg:hidden">
            <div>
              <p className="text-xs font-medium text-gray-text">{greeting}</p>
              <p className="text-base font-bold text-brand-dark leading-tight">
                {firstName ? firstName : 'Mi espacio'}
              </p>
            </div>
            <button
              onClick={signOut}
              disabled={isSigningOut}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-text transition-colors hover:border-brand-primary/50 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cerrar sesión"
            >
              {isSigningOut ? 'Saliendo…' : 'Salir'}
            </button>
          </header>

          {/* Page content */}
          <main className="flex flex-1 flex-col pb-24 lg:pb-0">
            {children}
          </main>

          {/* Tab bar hides itself on desktop via its own lg:hidden */}
          <PatientTabBar activeTab={activeTab} />
        </div>
      </div>
    </>
  );
}
