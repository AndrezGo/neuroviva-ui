'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getPendingResources,
  approveResource,
  rejectResource,
  createResource,
} from '@/infrastructure/api/contentApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { PendingResource, CreateResourceInput } from '@/domain/content/content.types';

export interface UseCuratorResourcesReturn {
  pending: PendingResource[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  /** Approves a resource by id. Returns true on success, false on failure. */
  approve: (id: string) => Promise<boolean>;
  /** The id of the resource currently being approved, or null. */
  approvingId: string | null;
  /** Rejects a resource by id. */
  reject: (id: string) => Promise<void>;
  /** The id of the resource currently being rejected, or null. */
  rejectingId: string | null;
  /** Creates a new resource. Returns true on success, false on failure. */
  create: (input: CreateResourceInput) => Promise<boolean>;
  isCreating: boolean;
  /** Validation/API error from the most recent create call, or null. */
  createError: string | null;
}

/**
 * Manages the scientific-committee curation workflow:
 * fetching pending resources and performing approve / reject / create actions.
 * Mirrors the fetch + action pattern from useCaregiverSymptoms.
 */
export function useCuratorResources(): UseCuratorResourcesReturn {
  const addToast = useToastStore((s) => s.addToast);

  // ── Fetch state ────────────────────────────────────────────────────────────
  const [pending, setPending] = useState<PendingResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // ── Action state ───────────────────────────────────────────────────────────
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ── Reload ─────────────────────────────────────────────────────────────────
  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setPending([]);

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
      setPending(data);
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

  // ── approve ────────────────────────────────────────────────────────────────
  const approve = useCallback(
    async (id: string): Promise<boolean> => {
      setApprovingId(id);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          addToast({ type: 'error', message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
          return false;
        }

        await approveResource(token, id);
        reload();
        addToast({ type: 'success', message: 'Recurso aprobado' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo aprobar el recurso. Por favor intenta de nuevo.';
        addToast({ type: 'error', message });
        return false;
      } finally {
        setApprovingId(null);
      }
    },
    [reload, addToast],
  );

  // ── reject ─────────────────────────────────────────────────────────────────
  const reject = useCallback(
    async (id: string): Promise<void> => {
      setRejectingId(id);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          addToast({ type: 'error', message: 'Tu sesión expiró. Inicia sesión de nuevo.' });
          return;
        }

        await rejectResource(token, id);
        reload();
        addToast({ type: 'success', message: 'Recurso rechazado' });
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo rechazar el recurso. Por favor intenta de nuevo.';
        addToast({ type: 'error', message });
      } finally {
        setRejectingId(null);
      }
    },
    [reload, addToast],
  );

  // ── create ─────────────────────────────────────────────────────────────────
  const create = useCallback(
    async (input: CreateResourceInput): Promise<boolean> => {
      setIsCreating(true);
      setCreateError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          const msg = 'Tu sesión expiró. Inicia sesión de nuevo.';
          setCreateError(msg);
          addToast({ type: 'error', message: msg });
          return false;
        }

        await createResource(token, input);
        reload();
        addToast({ type: 'success', message: 'Recurso creado y enviado a revisión' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo crear el recurso. Por favor intenta de nuevo.';
        setCreateError(message);
        addToast({ type: 'error', message });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [reload, addToast],
  );

  return {
    pending,
    isLoading,
    isError,
    error,
    reload,
    approve,
    approvingId,
    reject,
    rejectingId,
    create,
    isCreating,
    createError,
  };
}
