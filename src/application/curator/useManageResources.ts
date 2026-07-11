'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getAllResources, updateResource } from '@/infrastructure/api/contentApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { AllResourceItem, UpdateResourceInput } from '@/domain/content/content.types';

export interface UseManageResourcesReturn {
  resources: AllResourceItem[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  /** Updates an existing resource — full replacement. Returns true on success, false on failure. */
  update: (id: string, input: UpdateResourceInput) => Promise<boolean>;
  isUpdating: boolean;
  /** Validation/API error from the most recent update call, or null. */
  updateError: string | null;
}

/**
 * Fetches the full list of all resources (any approval status) once on mount,
 * and exposes an update action for editing existing resources.
 * Models the fetch part on useDiseases and the update part on useChannels.update.
 */
export function useManageResources(): UseManageResourcesReturn {
  const addToast = useToastStore((s) => s.addToast);

  // ── Fetch state ─────────────────────────────────────────────────────────────
  const [resources, setResources] = useState<AllResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // ── Action state ─────────────────────────────────────────────────────────────
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // ── Reload ───────────────────────────────────────────────────────────────────
  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setResources([]);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getAllResources(token);

      if (!active.current) return;
      setResources(data);
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

  // ── update ───────────────────────────────────────────────────────────────────
  const update = useCallback(
    async (id: string, input: UpdateResourceInput): Promise<boolean> => {
      setIsUpdating(true);
      setUpdateError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          const msg = 'Tu sesión expiró. Inicia sesión de nuevo.';
          setUpdateError(msg);
          addToast({ type: 'error', message: msg });
          return false;
        }

        await updateResource(token, id, input);
        reload();
        addToast({ type: 'success', message: 'Recurso actualizado' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar el recurso. Por favor intenta de nuevo.';
        setUpdateError(message);
        addToast({ type: 'error', message });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [reload, addToast],
  );

  return { resources, isLoading, isError, error, reload, update, isUpdating, updateError };
}
