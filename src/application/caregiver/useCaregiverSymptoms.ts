'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  listSymptoms,
  updateSymptom as updateSymptomRepo,
  deleteSymptom as deleteSymptomRepo,
} from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { Symptom, UpdateSymptomPayload } from '@/domain/caregiver/caregiver.types';

export interface UseCaregiverSymptomsReturn {
  symptoms: Symptom[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  updateSymptom: (id: string, payload: UpdateSymptomPayload) => Promise<boolean>;
  isUpdating: boolean;
  updateError: string | null;
  deleteSymptom: (id: string) => Promise<boolean>;
  deletingId: string | null;
  deleteError: string | null;
}

/**
 * Fetches the list of symptoms for the caregiver's patient.
 * Mirrors the fetch pattern established in useCaregiverMedications.
 */
export function useCaregiverSymptoms(): UseCaregiverSymptomsReturn {
  const addToast = useToastStore((s) => s.addToast);

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setSymptoms([]);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await listSymptoms(token);

      if (!active.current) return;
      setSymptoms(data);
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

  const updateSymptom = useCallback(
    async (id: string, payload: UpdateSymptomPayload): Promise<boolean> => {
      setIsUpdating(true);
      setUpdateError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setUpdateError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        await updateSymptomRepo(token, id, payload);
        reload();
        addToast({ type: 'success', message: 'Síntoma actualizado correctamente' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar el síntoma. Por favor intenta de nuevo.';
        setUpdateError(message);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [reload, addToast],
  );

  const deleteSymptom = useCallback(
    async (id: string): Promise<boolean> => {
      setDeletingId(id);
      setDeleteError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setDeleteError('Tu sesión expiró. Inicia sesión de nuevo.');
          addToast({ type: 'error', message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
          return false;
        }

        await deleteSymptomRepo(token, id);
        reload();
        addToast({ type: 'success', message: 'Síntoma eliminado' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo eliminar el síntoma. Por favor intenta de nuevo.';
        setDeleteError(message);
        addToast({ type: 'error', message });
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [reload, addToast],
  );

  return {
    symptoms,
    isLoading,
    isError,
    error,
    reload,
    updateSymptom,
    isUpdating,
    updateError,
    deleteSymptom,
    deletingId,
    deleteError,
  };
}
