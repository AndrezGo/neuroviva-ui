'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getMedications,
  createMedication as createMedicationRepo,
  logMedication as logMedicationRepo,
  updateMedication as updateMedicationRepo,
  discontinueMedication as discontinueMedicationRepo,
} from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { Medication, CreateMedicationInput, UpdateMedicationInput } from '@/domain/caregiver/caregiver.types';

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
  updateMedication: (id: string, input: UpdateMedicationInput) => Promise<boolean>;
  isUpdating: boolean;
  updateError: string | null;
  discontinueMedication: (id: string) => Promise<boolean>;
  discontinuingId: string | null;
  discontinueError: string | null;
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

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [discontinuingId, setDiscontinuingId] = useState<string | null>(null);
  const [discontinueError, setDiscontinueError] = useState<string | null>(null);

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
          prescribingDoctorName: input.prescribingDoctorName || undefined,
          notes: input.notes || undefined,
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

  const updateMedication = useCallback(
    async (id: string, input: UpdateMedicationInput): Promise<boolean> => {
      setIsUpdating(true);
      setUpdateError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setUpdateError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        // Map empty-string optional fields to undefined so the backend
        // receives clean JSON without empty-string fields.
        const payload: UpdateMedicationInput = {
          name: input.name,
          dose: input.dose,
          frequency: input.frequency,
          startDate: input.startDate,
          endDate: input.endDate || undefined,
          prescribingDoctorName: input.prescribingDoctorName || undefined,
          notes: input.notes || undefined,
        };

        await updateMedicationRepo(token, id, payload);
        reload();
        addToast({ type: 'success', message: 'Medicamento actualizado correctamente' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar el medicamento. Por favor intenta de nuevo.';
        setUpdateError(message);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [reload, addToast],
  );

  const discontinueMedication = useCallback(
    async (id: string): Promise<boolean> => {
      setDiscontinuingId(id);
      setDiscontinueError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setDiscontinueError('Tu sesión expiró. Inicia sesión de nuevo.');
          addToast({ type: 'error', message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
          return false;
        }

        await discontinueMedicationRepo(token, id);
        reload();
        addToast({ type: 'success', message: 'Medicamento descontinuado' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo descontinuar el medicamento. Por favor intenta de nuevo.';
        setDiscontinueError(message);
        addToast({ type: 'error', message });
        return false;
      } finally {
        setDiscontinuingId(null);
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
    updateMedication,
    isUpdating,
    updateError,
    discontinueMedication,
    discontinuingId,
    discontinueError,
  };
}
