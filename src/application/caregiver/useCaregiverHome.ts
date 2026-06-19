'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase/client.browser';
import { getCaregiverPatient, getCaregiverToday } from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useCaregiverOnboardingStore } from '@/shared/store/useCaregiverOnboardingStore';
import type { CaregiverPatient, CaregiverToday } from '@/domain/caregiver/caregiver.types';

export interface UseCaregiverHomeReturn {
  patient: CaregiverPatient | null;
  today: CaregiverToday | null;
  patientMissing: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  /** Caregiver's onboarding patient name — used as fallback greeting when patient API returns 404. */
  fallbackPatientName: string;
  reload: () => void;
}

/**
 * Orchestrates all data fetches for the Caregiver Inicio screen.
 * Handles auth-expired, 404 patient-not-found, and general API errors distinctly.
 */
export function useCaregiverHome(): UseCaregiverHomeReturn {
  const [patient, setPatient] = useState<CaregiverPatient | null>(null);
  const [today, setToday] = useState<CaregiverToday | null>(null);
  const [patientMissing, setPatientMissing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback: use the name entered during onboarding if backend patient doesn't exist yet
  const fallbackPatientName = useCaregiverOnboardingStore((s) => s.patientName);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setPatient(null);
    setToday(null);
    setPatientMissing(false);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const token = session.access_token;

      // Fetch patient and today in parallel — patient 404 must not kill today fetch
      const [patientResult, todayResult] = await Promise.allSettled([
        getCaregiverPatient(token),
        getCaregiverToday(token),
      ]);

      if (!active.current) return;

      // Handle patient result
      if (patientResult.status === 'fulfilled') {
        setPatient(patientResult.value);
        setPatientMissing(false);
      } else {
        const err = patientResult.reason;
        if (err instanceof ApiError && err.status === 404) {
          // Patient hasn't been created yet — soft state, not a hard error
          setPatientMissing(true);
        } else if (err instanceof ApiError && err.status === 403) {
          // Role not yet in JWT — needs fresh login after backend sync
          setIsError(true);
          setError('Para continuar, cierra sesión e inicia de nuevo. Tu perfil de cuidador necesita actualizarse.');
          setIsLoading(false);
          return;
        } else {
          // Non-404/403 patient error is a hard error
          const message =
            err instanceof ApiError
              ? err.message
              : 'Error al cargar el perfil del paciente.';
          setIsError(true);
          setError(message);
          setIsLoading(false);
          return;
        }
      }

      // Handle today result
      if (todayResult.status === 'fulfilled') {
        setToday(todayResult.value);
      } else {
        const err = todayResult.reason;
        const message =
          err instanceof ApiError
            ? err.message
            : 'Error al cargar las tareas de hoy.';
        setIsError(true);
        setError(message);
      }
    } catch (err) {
      if (!active.current) return;
      const message =
        err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
      setIsError(true);
      setError(message);
    } finally {
      if (active.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const active = { current: true };
    fetchData(active);
    return () => {
      active.current = false;
    };
  }, [fetchData, reloadKey]);

  return {
    patient,
    today,
    patientMissing,
    isLoading,
    isError,
    error,
    fallbackPatientName,
    reload,
  };
}
