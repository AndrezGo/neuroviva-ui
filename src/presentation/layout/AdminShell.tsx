'use client';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { useSignOut } from '@/application/auth/useSignOut';
import { getFirstName } from '@/shared/lib/greeting';
import { AdminDesktopSidebar } from './AdminDesktopSidebar';
import { AdminDesktopHeader } from './AdminDesktopHeader';
import type { AdminTab } from '@/presentation/admin/AdminTabBar';

interface AdminShellProps {
  activeTab: AdminTab;
  children: React.ReactNode;
}

/**
 * Orchestrates mobile vs desktop layout for the Admin section.
 * Mirrors DoctorShell exactly — same responsive pattern, same content wrapper class.
 *
 * Mobile (< lg):  centered max-w-md column (white) on a slate-100 background.
 *                 AdminTabBar is already composed inside each screen.
 *
 * Desktop (≥ lg): gradient sidebar (fixed 240 px) + fixed top header +
 *                 full-width scrollable content area offset by the chrome.
 *
 * No notifications hook — admins manage content and community, not patient alerts.
 */
export function AdminShell({ activeTab, children }: AdminShellProps) {
  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const firstName = getFirstName(backendUser?.name ?? user?.fullName);
  const email = backendUser?.email ?? user?.email ?? '';

  const { signOut, isLoading: isSigningOut } = useSignOut();

  return (
    <>
      {/* Desktop chrome — hidden on mobile via internal lg:flex / lg:block */}
      <AdminDesktopSidebar activeTab={activeTab} />
      <AdminDesktopHeader
        firstName={firstName}
        email={email}
        onSignOut={signOut}
        isSigningOut={isSigningOut}
      />

      {/* Outer background layer */}
      <div className="min-h-dvh w-full overflow-x-hidden bg-slate-100 lg:bg-transparent">
        {/* Mobile: max-w-md column. Desktop: full-width offsetting sidebar+header */}
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white lg:max-w-none lg:mx-0 lg:ml-60 lg:w-[calc(100%-15rem)] lg:bg-gray-50 lg:pt-16">
          {children}
        </div>
      </div>
    </>
  );
}
