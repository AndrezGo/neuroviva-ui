'use client';

import { useState, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { registerSymptom as registerSymptomRepo } from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { CreateSymptomPayload } from '@/domain/caregiver/caregiver.types';

export interface UseRegisterSymptomReturn {
  registerSymptom: (payload: CreateSymptomPayload) => Promise<boolean>;
  isSaving: boolean;
  error: string | null;
  resetError: () => void;
}

/**
 * Mutation hook for registering a new symptom.
 * Mirrors the pattern from useUpdatePatientAge / useUpdatePatientBirthDate.
 */
export function useRegisterSymptom(): UseRegisterSymptomReturn {
  const addToast = useToastStore((s) => s.addToast);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const registerSymptom = useCallback(
    async (payload: CreateSymptomPayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        await registerSymptomRepo(token, payload);
        addToast({ type: 'success', message: 'Síntoma registrado correctamente' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo registrar el síntoma. Por favor intenta de nuevo.';
        setError(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [addToast],
  );

  return {
    registerSymptom,
    isSaving,
    error,
    resetError,
  };
}
