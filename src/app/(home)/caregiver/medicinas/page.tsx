'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverMedications } from '@/application/caregiver/useCaregiverMedications';
import { CaregiverMedicationsScreen } from '@/presentation/caregiver/CaregiverMedicationsScreen';
import { routes } from '@/core/routing/routes';

/**
 * Thin page: wires useCaregiverMedications hook to CaregiverMedicationsScreen.
 * No business logic here.
 */
export default function CaregiverMedicinasPage() {
  const router = useRouter();
  const {
    medications,
    isLoading,
    isError,
    error,
    reload,
    logMedication,
    loggingId,
    logError,
  } = useCaregiverMedications();

  const handleAdd = useCallback(() => {
    router.push(routes.caregiverMedsNew());
  }, [router]);

  return (
    <CaregiverMedicationsScreen
      medications={medications}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onReload={reload}
      onAdd={handleAdd}
      onLog={logMedication}
      loggingId={loggingId}
      logError={logError}
    />
  );
}
