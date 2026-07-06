'use client';

import { useState, useCallback } from 'react';
import { useCaregiverSymptoms } from '@/application/caregiver/useCaregiverSymptoms';
import { useRegisterSymptom } from '@/application/caregiver/useRegisterSymptom';
import { CaregiverSymptomsScreen } from '@/presentation/caregiver/CaregiverSymptomsScreen';
import { RegisterSymptomSheet } from '@/presentation/caregiver/RegisterSymptomSheet';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';
import type { Symptom } from '@/domain/caregiver/caregiver.types';

/**
 * Thin page: wires useCaregiverSymptoms + useRegisterSymptom to CaregiverSymptomsScreen.
 * No business logic here.
 */
export default function CaregiverSintomasPage() {
  const {
    symptoms,
    isLoading,
    isError,
    error,
    reload,
    updateSymptom,
    isUpdating,
    updateError,
    deleteSymptom,
    deletingId,
    deleteError,
  } = useCaregiverSymptoms();
  const { registerSymptom, isSaving, error: saveError, resetError } = useRegisterSymptom();

  const [registerSheetOpen, setRegisterSheetOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);

  const noop = useCallback(() => {}, []);

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

  const onEditSymptom = useCallback((symptom: Symptom) => {
    setEditingSymptom(symptom);
  }, []);

  const onCloseEdit = useCallback(() => {
    setEditingSymptom(null);
  }, []);

  const onSaveEdit = useCallback(
    async (type: string, intensity: number, description?: string) => {
      if (!editingSymptom) return;
      const ok = await updateSymptom(editingSymptom.id, {
        type,
        intensity,
        description: description ?? null,
      });
      if (ok) {
        setEditingSymptom(null);
      }
    },
    [editingSymptom, updateSymptom],
  );

  const onDeleteSymptom = useCallback(
    (id: string) => deleteSymptom(id),
    [deleteSymptom],
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
        onEdit={onEditSymptom}
        onDelete={onDeleteSymptom}
        deletingId={deletingId}
        deleteError={deleteError}
      />

      <RegisterSymptomSheet
        open={editingSymptom !== null}
        mode="edit"
        initialValues={
          editingSymptom
            ? {
                type: editingSymptom.type,
                intensity: editingSymptom.intensity,
                description: editingSymptom.description,
              }
            : undefined
        }
        isSaving={isUpdating}
        error={updateError}
        onClose={onCloseEdit}
        onSave={onSaveEdit}
        onClearError={noop}
      />
    </CaregiverShell>
  );
}
