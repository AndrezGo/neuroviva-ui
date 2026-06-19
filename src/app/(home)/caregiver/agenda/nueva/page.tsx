'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverAppointments } from '@/application/caregiver/useCaregiverAppointments';
import { AppointmentFormScreen } from '@/presentation/caregiver/AppointmentFormScreen';
import { routes } from '@/core/routing/routes';
import type { AppointmentFormValues } from '@/application/caregiver/caregiverSchemas';

/**
 * Thin page: wires the createAppointment action to AppointmentFormScreen.
 * Navigates back to the agenda list on success.
 */
export default function CaregiverAgendaNuevaPage() {
  const router = useRouter();
  const { createAppointment, isCreating, createError } = useCaregiverAppointments();

  const handleSubmit = useCallback(
    async (values: AppointmentFormValues): Promise<boolean> => {
      const success = await createAppointment(values);
      if (success) {
        router.push(routes.caregiverAgenda());
      }
      return success;
    },
    [createAppointment, router],
  );

  return (
    <AppointmentFormScreen
      onSubmit={handleSubmit}
      isSubmitting={isCreating}
      submitError={createError}
    />
  );
}
