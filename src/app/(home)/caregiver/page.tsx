'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverHome } from '@/application/caregiver/useCaregiverHome';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useSignOut } from '@/application/auth/useSignOut';
import { useNotificationsStore } from '@/shared/store/useNotificationsStore';
import { getGreeting, getFirstName } from '@/shared/lib/greeting';
import { CaregiverHomeScreen } from '@/presentation/caregiver/CaregiverHomeScreen';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';
import { routes } from '@/core/routing/routes';

/**
 * Caregiver Inicio page — thin page component that wires hooks to the screen.
 * All data fetching is delegated to useCaregiverHome; UI is in CaregiverHomeScreen.
 *
 * Notifications:
 *   - The single useNotifications() instance lives in CaregiverShell (which is
 *     always mounted around this page). The store it populates is read here to
 *     derive unreadCount for the mobile bell without triggering a second fetch.
 *   - The mobile bell's onBellClick calls openPanel() from the same store so
 *     both desktop and mobile bells open the identical panel rendered in the shell.
 */
export default function CaregiverHomePage() {
  const router = useRouter();

  // Auth store — caregiver's own name for the greeting
  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const firstName = getFirstName(backendUser?.name ?? user?.fullName);
  const greeting = getGreeting();

  const {
    patient,
    patientMissing,
    today,
    isLoading,
    isError,
    error,
    reload,
  } = useCaregiverHome();

  // ── Notifications (mobile) — read store, no extra fetch ────────────────────
  const notifications = useNotificationsStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const openPanel = useNotificationsStore((s) => s.openPanel);

  const onPatientClick = useCallback(() => {
    router.push(routes.caregiverPatientProfile());
  }, [router]);

  const { signOut } = useSignOut();

  const onBellClick = useCallback(() => {
    openPanel();
  }, [openPanel]);

  return (
    <CaregiverShell activeTab="home">
      <CaregiverHomeScreen
        greeting={greeting}
        firstName={firstName}
        patient={patient}
        patientMissing={patientMissing}
        today={today}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        onSignOut={signOut}
        onBellClick={onBellClick}
        onPatientClick={onPatientClick}
        unreadCount={unreadCount}
      />
    </CaregiverShell>
  );
}
