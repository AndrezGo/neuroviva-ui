'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getCaregiverPatient } from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { CaregiverPatient } from '@/domain/caregiver/caregiver.types';

export interface UseCaregiverPatientReturn {
  patient: CaregiverPatient | null;
  patientMissing: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Orchestrates the fetch for the Caregiver Patient Profile screen.
 * Handles auth-expired, 404 patient-not-found, 403 role-not-synced,
 * and general API errors distinctly — mirroring the pattern in useCaregiverHome.
 */
export function useCaregiverPatient(): UseCaregiverPatientReturn {
  const [patient, setPatient] = useState<CaregiverPatient | null>(null);
  const [patientMissing, setPatientMissing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setPatient(null);
    setPatientMissing(false);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getCaregiverPatient(token);

      if (!active.current) return;
      setPatient(data);
    } catch (err) {
      if (!active.current) return;

      if (err instanceof ApiError && err.status === 404) {
        // Patient hasn't been created yet — soft state, not a hard error
        setPatientMissing(true);
      } else if (err instanceof ApiError && err.status === 403) {
        // Role not yet in JWT — needs fresh login after backend sync
        setIsError(true);
        setError(
          'Para continuar, cierra sesión e inicia de nuevo. Tu perfil de cuidador necesita actualizarse.',
        );
      } else if (err instanceof ApiError) {
        setIsError(true);
        setError(err.message);
      } else {
        setIsError(true);
        setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      }
    } finally {
      if (active.current) {
        setIsLoading(false);
      }
    }
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
    patientMissing,
    isLoading,
    isError,
    error,
    reload,
  };
}
