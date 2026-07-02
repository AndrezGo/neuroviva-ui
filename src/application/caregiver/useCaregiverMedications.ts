'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getMedications,
  createMedication as createMedicationRepo,
  logMedication as logMedicationRepo,
} from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
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
  logMedication: (id: string, notes?: string) => Promise<boolean>;
  loggingId: string | null;
  logError: string | null;
}

/**
 * Orchestrates fetching and mutating medications for the Caregiver Medicinas screen.
 * Mirrors the pattern established in useCaregiverHome.
 */
export function useCaregiverMedications(): UseCaregiverMedicationsReturn {
  const addToast = useToastStore((s) => s.addToast);

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
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getMedications(token);

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
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
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
          intervalHours: input.intervalHours,
        };

        await createMedicationRepo(token, payload);
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

  const logMedication = useCallback(
    async (id: string, notes?: string): Promise<boolean> => {
      setLoggingId(id);
      setLogError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setLogError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        const body = notes?.trim() ? { notes: notes.trim() } : {};
        await logMedicationRepo(token, id, body);
        reload();
        addToast({ type: 'success', message: 'Toma registrada correctamente' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Error al registrar la toma';
        setLogError(message);
        addToast({ type: 'error', message });
        return false;
      } finally {
        setLoggingId(null);
      }
    },
    [reload, addToast],
  );

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
