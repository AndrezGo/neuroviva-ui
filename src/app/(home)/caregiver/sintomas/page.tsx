'use client';

import { useState, useCallback } from 'react';
import { useCaregiverSymptoms } from '@/application/caregiver/useCaregiverSymptoms';
import { useRegisterSymptom } from '@/application/caregiver/useRegisterSymptom';
import { CaregiverSymptomsScreen } from '@/presentation/caregiver/CaregiverSymptomsScreen';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';

/**
 * Thin page: wires useCaregiverSymptoms + useRegisterSymptom to CaregiverSymptomsScreen.
 * No business logic here.
 */
export default function CaregiverSintomasPage() {
  const { symptoms, isLoading, isError, error, reload } = useCaregiverSymptoms();
  const { registerSymptom, isSaving, error: saveError, resetError } = useRegisterSymptom();

  const [registerSheetOpen, setRegisterSheetOpen] = useState(false);

  const onRegister = useCallback(() => {
    setRegisterSheetOpen(true);
  }, []);

  const onCloseRegister = useCallback(() => {
    resetError();
    setRegisterSheetOpen(false);
  }, [resetError]);

  const onSaveSymptom = useCallback(
    async (type: string, intensity: number, description?: string) => {
      const ok = await registerSymptom({
        type,
        intensity,
        description: description ?? null,
      });
      if (ok) {
        setRegisterSheetOpen(false);
        reload();
      }
    },
    [registerSymptom, reload],
  );

  return (
    <CaregiverShell activeTab="symptoms">
      <CaregiverSymptomsScreen
        symptoms={symptoms}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        onRegister={onRegister}
        registerSheetOpen={registerSheetOpen}
        onCloseRegister={onCloseRegister}
        onSaveSymptom={onSaveSymptom}
        isSaving={isSaving}
        saveError={saveError}
        onClearSaveError={resetError}
      />
    </CaregiverShell>
  );
}
