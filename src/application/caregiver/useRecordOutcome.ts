'use client';

import { useState, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { recordAppointmentOutcome } from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { AppointmentOutcome } from '@/domain/caregiver/caregiver.types';

export interface UseRecordOutcomeReturn {
  recordOutcome: (id: string, outcome: AppointmentOutcome) => Promise<boolean>;
  isSubmitting: boolean;
  pendingId: string | null;
  pendingOutcome: AppointmentOutcome | null;
}

export function useRecordOutcome(): UseRecordOutcomeReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingOutcome, setPendingOutcome] = useState<AppointmentOutcome | null>(null);
  const { addToast } = useToastStore();

  const recordOutcome = useCallback(
    async (id: string, outcome: AppointmentOutcome): Promise<boolean> => {
      setIsSubmitting(true);
      setPendingId(id);
      setPendingOutcome(outcome);
      try {
        const token = await supabaseAuthRepository.getAccessToken();
        if (!token) {
          addToast({ type: 'error', message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
          return false;
        }
        await recordAppointmentOutcome(token, id, outcome);
        addToast({ type: 'success', message: 'Resultado registrado.' });
        return true;
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.';
        addToast({ type: 'error', message: msg });
        return false;
      } finally {
        setIsSubmitting(false);
        setPendingId(null);
        setPendingOutcome(null);
      }
    },
    [addToast],
  );

  return { recordOutcome, isSubmitting, pendingId, pendingOutcome };
}
