'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverMedications } from '@/application/caregiver/useCaregiverMedications';
import { MedicationFormScreen } from '@/presentation/caregiver/MedicationFormScreen';
import { routes } from '@/core/routing/routes';
import type { MedicationFormValues } from '@/application/caregiver/caregiverSchemas';

/**
 * Thin page: wires the createMedication action to MedicationFormScreen.
 * Navigates back to the medications list on success.
 */
export default function CaregiverMedicinasNuevoPage() {
  const router = useRouter();
  const { createMedication, isCreating, createError } = useCaregiverMedications();

  const handleSubmit = useCallback(
    async (values: MedicationFormValues): Promise<boolean> => {
      const success = await createMedication(values);
      if (success) {
        router.push(routes.caregiverMeds());
      }
      return success;
    },
    [createMedication, router],
  );

  return (
    <MedicationFormScreen
      onSubmit={handleSubmit}
      isSubmitting={isCreating}
      submitError={createError}
    />
  );
}
