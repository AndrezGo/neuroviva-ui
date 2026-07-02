'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverMedications } from '@/application/caregiver/useCaregiverMedications';
import { CaregiverMedicationsScreen } from '@/presentation/caregiver/CaregiverMedicationsScreen';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';
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
    discontinueMedication,
    discontinuingId,
    discontinueError,
  } = useCaregiverMedications();

  const handleAdd = useCallback(() => {
    router.push(routes.caregiverMedsNew());
  }, [router]);

  const handleViewHistory = useCallback(
    (id: string) => {
      router.push(routes.caregiverMedHistory(id));
    },
    [router],
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(routes.caregiverMedEdit(id));
    },
    [router],
  );

  return (
    <CaregiverShell activeTab="meds">
      <CaregiverMedicationsScreen
        medications={medications}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        onAdd={handleAdd}
        onLog={logMedication}
        onViewHistory={handleViewHistory}
        loggingId={loggingId}
        logError={logError}
        onEdit={handleEdit}
        onDiscontinue={discontinueMedication}
        discontinuingId={discontinuingId}
        discontinueError={discontinueError}
      />
    </CaregiverShell>
  );
}
