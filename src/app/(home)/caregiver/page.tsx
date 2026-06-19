'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverHome } from '@/application/caregiver/useCaregiverHome';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { getGreeting, getFirstName } from '@/shared/lib/greeting';
import { CaregiverHomeScreen } from '@/presentation/caregiver/CaregiverHomeScreen';
import { routes } from '@/core/routing/routes';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase/client.browser';

/**
 * Caregiver Inicio page — thin page component that wires hooks to the screen.
 * All data fetching is delegated to useCaregiverHome; UI is in CaregiverHomeScreen.
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

  const onPatientClick = useCallback(() => {
    router.push(routes.caregiverPatientProfile());
  }, [router]);

  const clearAuth = useAuthStore((s) => s.clear);

  const onSignOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    clearAuth();
    router.push(routes.login());
  }, [clearAuth, router]);

  const onBellClick = useCallback(() => {
    // Notifications panel — stub for now
  }, []);

  return (
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
      onSignOut={onSignOut}
      onBellClick={onBellClick}
      onPatientClick={onPatientClick}
    />
  );
}
