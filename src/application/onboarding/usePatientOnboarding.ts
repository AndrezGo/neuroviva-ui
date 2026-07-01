'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { submitPatientOnboarding } from '@/infrastructure/api/patientApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { routes } from '@/core/routing/routes';

export interface UsePatientOnboardingReturn {
  documentNumber: string;
  setDocumentNumber: (doc: string) => void;
  canContinue: boolean;
  isLoading: boolean;
  error: string | null;
  finish: () => Promise<void>;
}

/**
 * Orchestrates the single-step patient onboarding flow.
 * Submits the document number to link the patient's account to their profile.
 */
export function usePatientOnboarding(): UsePatientOnboardingReturn {
  const router = useRouter();

  const [documentNumber, setDocumentNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = documentNumber.trim().length >= 3;

  const finish = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        router.push(routes.login());
        return;
      }

      await submitPatientOnboarding(token, { documentNumber: documentNumber.trim() });
      router.push(routes.patientHome());
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [documentNumber, router]);

  return {
    documentNumber,
    setDocumentNumber,
    canContinue,
    isLoading,
    error,
    finish,
  };
}
