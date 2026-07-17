'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getClinicalNotes,
  uploadClinicalNote as uploadClinicalNoteRepo,
} from '@/infrastructure/api/medicalRecordApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type {
  ClinicalRecordDto,
  UploadClinicalNoteInput,
} from '@/domain/medical-record/medicalRecord.types';

export interface UseClinicalNotesReturn {
  notes: ClinicalRecordDto[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  upload: (input: UploadClinicalNoteInput) => Promise<boolean>;
  isSaving: boolean;
  saveError: string | null;
  resetError: () => void;
}

/**
 * Fetches the clinical note records for a patient and exposes a mutation to
 * upload new notes. Mirrors the active-ref cancellation and reload pattern
 * from the active-ref cancellation pattern used across this project.
 */
export function useClinicalNotes(patientId: string): UseClinicalNotesReturn {
  const addToast = useToastStore((s) => s.addToast);

  const [notes, setNotes] = useState<ClinicalRecordDto[]>([]);
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

  const fetchData = useCallback(
    async (active: { current: boolean }) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      setNotes([]);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          if (!active.current) return;
          setIsError(true);
          setError('Tu sesión expiró. Inicia sesión de nuevo.');
          setIsLoading(false);
          return;
        }

        const data = await getClinicalNotes(token, patientId);

        if (!active.current) return;
        setNotes(data);
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

  const upload = useCallback(
    async (input: UploadClinicalNoteInput): Promise<boolean> => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setSaveError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        await uploadClinicalNoteRepo(token, patientId, input);
        addToast({ type: 'success', message: 'Nota clínica agregada correctamente' });
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
    [addToast, patientId],
  );

  return {
    notes,
    isLoading,
    isError,
    error,
    reload,
    upload,
    isSaving,
    saveError,
    resetError,
  };
}
