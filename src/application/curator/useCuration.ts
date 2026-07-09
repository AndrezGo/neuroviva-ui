'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getPendingResources,
  createResource,
  approveResource,
  rejectResource,
} from '@/infrastructure/api/contentApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { PendingResource, CreateResourceInput } from '@/domain/content/content.types';

export interface UseCurationReturn {
  pendingResources: PendingResource[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  approve: (id: string) => Promise<boolean>;
  reject: (id: string) => Promise<boolean>;
  create: (input: CreateResourceInput) => Promise<boolean>;
  /** ID of the resource currently being approved or rejected; null when idle. */
  actioningId: string | null;
  isCreating: boolean;
}

/**
 * Fetches and manages the curator's pending resource queue.
 * Mirrors the fetch + action pattern from useCaregiverSymptoms.
 * All three actions (approve, reject, create) obtain a fresh token,
 * call the repo, then reload the list and fire a toast on success/failure.
 */
export function useCuration(): UseCurationReturn {
  const addToast = useToastStore((s) => s.addToast);

  const [pendingResources, setPendingResources] = useState<PendingResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [actioningId, setActioningId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setPendingResources([]);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getPendingResources(token);

      if (!active.current) return;
      setPendingResources(data);
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

  const approve = useCallback(
    async (id: string): Promise<boolean> => {
      setActioningId(id);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          addToast({ type: 'error', message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
          return false;
        }

        await approveResource(token, id);
        reload();
        addToast({ type: 'success', message: 'Recurso aprobado correctamente.' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo aprobar el recurso. Por favor intenta de nuevo.';
        addToast({ type: 'error', message });
        return false;
      } finally {
        setActioningId(null);
      }
    },
    [reload, addToast],
  );

  const reject = useCallback(
    async (id: string): Promise<boolean> => {
      setActioningId(id);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          addToast({ type: 'error', message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
          return false;
        }

        await rejectResource(token, id);
        reload();
        addToast({ type: 'success', message: 'Recurso rechazado.' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo rechazar el recurso. Por favor intenta de nuevo.';
        addToast({ type: 'error', message });
        return false;
      } finally {
        setActioningId(null);
      }
    },
    [reload, addToast],
  );

  const create = useCallback(
    async (input: CreateResourceInput): Promise<boolean> => {
      setIsCreating(true);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          addToast({ type: 'error', message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
          return false;
        }

        await createResource(token, input);
        reload();
        addToast({ type: 'success', message: 'Recurso creado correctamente.' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo crear el recurso. Por favor intenta de nuevo.';
        addToast({ type: 'error', message });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [reload, addToast],
  );

  return {
    pendingResources,
    isLoading,
    isError,
    error,
    reload,
    approve,
    reject,
    create,
    actioningId,
    isCreating,
  };
}
