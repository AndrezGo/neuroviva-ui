'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getFollowUp } from '@/infrastructure/api/medicalRecordApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { FollowUpEvent } from '@/domain/medical-record/medicalRecord.types';

export interface UseFollowUpReturn {
  events: FollowUpEvent[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Read-only hook: fetches the follow-up event timeline for a patient.
 * Mirrors the active-ref cancellation and reload pattern used across this project.
 */
export function useFollowUp(patientId: string): UseFollowUpReturn {
  const [events, setEvents] = useState<FollowUpEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(
    async (active: { current: boolean }) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      setEvents([]);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          if (!active.current) return;
          setIsError(true);
          setError('Tu sesión expiró. Inicia sesión de nuevo.');
          setIsLoading(false);
          return;
        }

        const data = await getFollowUp(token, patientId);

        if (!active.current) return;
        setEvents(data);
      } catch (err) {
        if (!active.current) return;
        const message =
          err instanceof ApiError
            ? err.message
            : 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
        setIsError(true);
        setError(message);
      } finally {
        if (active.current) {
          setIsLoading(false);
        }
      }
    },
    [patientId],
  );

  useEffect(() => {
    const active = { current: true };
    fetchData(active);
    return () => {
      active.current = false;
    };
  }, [fetchData, reloadKey]);

  return {
    events,
    isLoading,
    isError,
    error,
    reload,
  };
}
