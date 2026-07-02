'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useSignOut } from '@/application/auth/useSignOut';
import { useNotifications } from '@/application/caregiver/useNotifications';
import { useNotificationsStore } from '@/shared/store/useNotificationsStore';
import { getFirstName } from '@/shared/lib/greeting';
import { CaregiverDesktopSidebar } from './CaregiverDesktopSidebar';
import { CaregiverDesktopHeader } from './CaregiverDesktopHeader';
import { NotificationsPanel } from '@/presentation/caregiver/NotificationsPanel';
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
 *
 * Notifications:
 *   useNotifications() is called HERE (single mount) which populates
 *   useNotificationsStore. Both the desktop header (via unreadCount prop) and
 *   the mobile bell (via page.tsx reading the same store) share one source of
 *   truth. The panel open/close state also lives in the store so any part of
 *   the tree can open it without prop drilling.
 */
export function CaregiverShell({ activeTab, children }: CaregiverShellProps) {
  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const firstName = getFirstName(backendUser?.name ?? user?.fullName);
  const email = backendUser?.email ?? user?.email ?? '';

  const { signOut, isLoading: isSigningOut } = useSignOut();

  // ── Notifications — single fetch owner ─────────────────────────────────────
  const { notifications, unreadCount, isLoading: notificationsLoading, markAllRead } =
    useNotifications();

  const panelOpen = useNotificationsStore((s) => s.panelOpen);
  const openPanel = useNotificationsStore((s) => s.openPanel);
  const closePanel = useNotificationsStore((s) => s.closePanel);

  const handleBellClick = useCallback(() => {
    openPanel();
  }, [openPanel]);

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
        unreadCount={unreadCount}
      />

      {/* Outer background layer */}
      <div className="min-h-dvh w-full overflow-x-hidden bg-slate-100 lg:bg-transparent">
        {/* Mobile: max-w-md column. Desktop: full-width offsetting sidebar+header */}
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white lg:max-w-none lg:mx-0 lg:ml-60 lg:w-[calc(100%-15rem)] lg:bg-gray-50 lg:pt-16">
          {children}
        </div>
      </div>

      {/* Notifications panel — portal-rendered, shared by desktop + mobile */}
      <NotificationsPanel
        open={panelOpen}
        onClose={closePanel}
        notifications={notifications}
        isLoading={notificationsLoading}
        onMarkAllRead={markAllRead}
      />
    </>
  );
}
