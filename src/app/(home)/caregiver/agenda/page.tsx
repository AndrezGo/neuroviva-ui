'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverAppointments } from '@/application/caregiver/useCaregiverAppointments';
import { CaregiverAppointmentsScreen } from '@/presentation/caregiver/CaregiverAppointmentsScreen';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';
import { routes } from '@/core/routing/routes';

/**
 * Thin page: wires useCaregiverAppointments hook to CaregiverAppointmentsScreen.
 * No business logic here.
 */
export default function CaregiverAgendaPage() {
  const router = useRouter();
  const {
    appointments,
    isLoading,
    isError,
    error,
    reload,
  } = useCaregiverAppointments();

  const handleAdd = useCallback(() => {
    router.push(routes.caregiverAgendaNew());
  }, [router]);

  return (
    <CaregiverShell activeTab="agenda">
      <CaregiverAppointmentsScreen
        appointments={appointments}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        onAdd={handleAdd}
      />
    </CaregiverShell>
  );
}
