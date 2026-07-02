'use client';

import { use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverMedications } from '@/application/caregiver/useCaregiverMedications';
import { MedicationFormScreen } from '@/presentation/caregiver/MedicationFormScreen';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';
import { BackButton } from '@/presentation/ui/BackButton';
import { routes } from '@/core/routing/routes';
import type { MedicationFormValues } from '@/application/caregiver/caregiverSchemas';

/**
 * Edit medication page.
 *
 * params is a Promise in Next.js 15+ — unwrapped via React's use() hook
 * as required by the Client Component convention documented in
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md
 */
export default function CaregiverMedicinasEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    medications,
    isLoading,
    updateMedication,
    isUpdating,
    updateError,
  } = useCaregiverMedications();

  const handleSubmit = useCallback(
    async (values: MedicationFormValues): Promise<boolean> => {
      // startDate is validated required by medicationEditSchema before reaching here
      const success = await updateMedication(id, {
        name: values.name,
        dose: values.dose,
        frequency: values.frequency,
        startDate: values.startDate as string,
        endDate: values.endDate,
        prescribingDoctorName: values.prescribingDoctorName,
        notes: values.notes,
      });
      if (success) {
        router.push(routes.caregiverMeds());
      }
      return success;
    },
    [id, updateMedication, router],
  );

  // Loading state while the medications list is being fetched
  if (isLoading) {
    return (
      <CaregiverShell activeTab="meds">
        <div className="flex flex-1 flex-col px-6 py-6">
          <div className="mb-6">
            <BackButton label="Volver a medicamentos" />
          </div>
          <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Cargando medicamento">
            <div className="h-7 w-48 rounded-full bg-gray-100" />
            <div className="h-12 rounded-2xl bg-gray-100" />
            <div className="h-12 rounded-2xl bg-gray-100" />
            <div className="h-12 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </CaregiverShell>
    );
  }

  const medication = medications.find((m) => m.id === id);

  // Not found after load
  if (!medication) {
    return (
      <CaregiverShell activeTab="meds">
        <div className="flex flex-1 flex-col px-6 py-6">
          <div className="mb-6">
            <BackButton label="Volver a medicamentos" />
          </div>
          <p className="text-sm font-medium text-error">Medicamento no encontrado.</p>
        </div>
      </CaregiverShell>
    );
  }

  const initialValues: Partial<MedicationFormValues> = {
    name: medication.name,
    dose: medication.dose,
    frequency: medication.frequency,
    startDate: medication.startDate ?? '',
    endDate: medication.endDate ?? '',
    prescribingDoctorName: medication.prescribingDoctorName ?? '',
    notes: medication.notes ?? '',
  };

  return (
    <CaregiverShell activeTab="meds">
      <MedicationFormScreen
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
        submitError={updateError}
      />
    </CaregiverShell>
  );
}
