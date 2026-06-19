'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase/client.browser';
import {
  getMedications,
  createMedication as createMedicationRepo,
  logMedication as logMedicationRepo,
} from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { Medication, CreateMedicationInput } from '@/domain/caregiver/caregiver.types';

export interface UseCaregiverMedicationsReturn {
  medications: Medication[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  createMedication: (input: CreateMedicationInput) => Promise<boolean>;
  isCreating: boolean;
  createError: string | null;
  logMedication: (id: string) => Promise<boolean>;
  loggingId: string | null;
  logError: string | null;
}

/**
 * Orchestrates fetching and mutating medications for the Caregiver Medicinas screen.
 * Mirrors the pattern established in useCaregiverHome.
 */
export function useCaregiverMedications(): UseCaregiverMedicationsReturn {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setMedications([]);

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

      const data = await getMedications(session.access_token);

      if (!active.current) return;
      setMedications(data);
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
  }, []);

  useEffect(() => {
    const active = { current: true };
    fetchData(active);
    return () => {
      active.current = false;
    };
  }, [fetchData, reloadKey]);

  const createMedication = useCallback(
    async (input: CreateMedicationInput): Promise<boolean> => {
      setIsCreating(true);
      setCreateError(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setCreateError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        // Map empty-string optional fields to undefined so the backend
        // receives clean JSON without empty-string date fields.
        const payload: CreateMedicationInput = {
          name: input.name,
          dose: input.dose,
          frequency: input.frequency,
          startDate: input.startDate || undefined,
          endDate: input.endDate || undefined,
        };

        await createMedicationRepo(session.access_token, payload);
        reload();
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo guardar el medicamento. Por favor intenta de nuevo.';
        setCreateError(message);
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [reload],
  );

  const logMedication = useCallback(async (id: string): Promise<boolean> => {
    setLoggingId(id);
    setLogError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLogError('Tu sesión expiró. Inicia sesión de nuevo.');
        return false;
      }

      await logMedicationRepo(session.access_token, id, {});
      return true;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo registrar la toma. Por favor intenta de nuevo.';
      setLogError(message);
      return false;
    } finally {
      setLoggingId(null);
    }
  }, []);

  return {
    medications,
    isLoading,
    isError,
    error,
    reload,
    createMedication,
    isCreating,
    createError,
    logMedication,
    loggingId,
    logError,
  };
}
