'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getClinicalHistory,
  addHistoryNote as addHistoryNoteRepo,
} from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { CreateHistoryNoteInput, HistoryEvent } from '@/domain/caregiver/caregiver.types';

export interface UseCaregiverHistoryReturn {
  events: HistoryEvent[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  addNote: (input: CreateHistoryNoteInput) => Promise<boolean>;
  isSaving: boolean;
  saveError: string | null;
  resetError: () => void;
}

/**
 * Fetches the clinical history timeline for the caregiver's patient and
 * exposes a mutation to add manual history notes.
 * Combines the fetch pattern from useCaregiverSymptoms with the
 * create/mutation pattern from useRegisterSymptom.
 */
export function useCaregiverHistory(): UseCaregiverHistoryReturn {
  const addToast = useToastStore((s) => s.addToast);

  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const resetError = useCallback(() => {
    setSaveError(null);
  }, []);

  const fetchData = useCallback(async (active: { current: boolean }) => {
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

      const data = await getClinicalHistory(token);

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
  }, []);

  useEffect(() => {
    const active = { current: true };
    fetchData(active);
    return () => {
      active.current = false;
    };
  }, [fetchData, reloadKey]);

  const addNote = useCallback(
    async (input: CreateHistoryNoteInput): Promise<boolean> => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setSaveError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        await addHistoryNoteRepo(token, input);
        addToast({ type: 'success', message: 'Nota agregada correctamente' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo agregar la nota. Por favor intenta de nuevo.';
        setSaveError(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [addToast],
  );

  return {
    events,
    isLoading,
    isError,
    error,
    reload,
    addNote,
    isSaving,
    saveError,
    resetError,
  };
}
