'use client';

import { useState, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { submitCaregiverOnboarding } from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import { useCaregiverOnboardingStore } from '@/shared/store/useCaregiverOnboardingStore';
import type { CaregiverPatient } from '@/domain/caregiver/caregiver.types';

export interface UseUpdatePatientBirthDateReturn {
  updateProfile: (
    patient: CaregiverPatient,
    name: string,
    dateOfBirth: string | null,
    conditions: string[],
  ) => Promise<boolean>;
  isSaving: boolean;
  error: string | null;
  resetError: () => void;
}

/**
 * Mutation hook that updates a patient's name, date of birth, and condition
 * via the idempotent onboarding endpoint. Reads documentNumber from the
 * persisted onboarding store; aborts with a clear message if it is missing.
 */
export function useUpdatePatientBirthDate(): UseUpdatePatientBirthDateReturn {
  const addToast = useToastStore((s) => s.addToast);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const updateProfile = useCallback(
    async (
      patient: CaregiverPatient,
      name: string,
      dateOfBirth: string | null,
      conditions: string[],
    ): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const documentNumber = useCaregiverOnboardingStore.getState().documentNumber.trim();

        if (documentNumber.length < 5) {
          setError(
            'No se pudo identificar al paciente. Ve a Inicio y vuelve a completar el registro del paciente.',
          );
          return false;
        }

        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        await submitCaregiverOnboarding(token, {
          documentNumber,
          patientName: name.trim() || patient.name,
          patientDateOfBirth: dateOfBirth,
          patientAge: null,
          relation: '',
          conditions: conditions.length > 0 ? conditions : patient.conditions,
        });

        addToast({ type: 'success', message: 'Información del paciente actualizada' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar la información. Por favor intenta de nuevo.';
        setError(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [addToast],
  );

  return {
    updateProfile,
    isSaving,
    error,
    resetError,
  };
}
