'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getChannels, createChannel, updateChannel } from '@/infrastructure/api/contentApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { Channel, CreateChannelInput, UpdateChannelInput } from '@/domain/content/content.types';

export interface UseChannelsReturn {
  channels: Channel[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  /** Creates a new channel. Returns true on success, false on failure. */
  create: (input: CreateChannelInput) => Promise<boolean>;
  isCreating: boolean;
  /** Validation/API error from the most recent create call, or null. */
  createError: string | null;
  /** Updates an existing channel — full replacement. Returns true on success, false on failure. */
  update: (id: string, input: UpdateChannelInput) => Promise<boolean>;
  isUpdating: boolean;
  /** Validation/API error from the most recent update call, or null. */
  updateError: string | null;
}

/**
 * Fetches the full list of channels once on mount for use in curation selectors,
 * and exposes a create action for adding new channels.
 * Follows the same fetch/cleanup pattern as useDiseases, with the create pattern
 * from useCuratorResources.
 */
export function useChannels(): UseChannelsReturn {
  const addToast = useToastStore((s) => s.addToast);

  // ── Fetch state ─────────────────────────────────────────────────────────────
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // ── Action state ─────────────────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
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
    setChannels([]);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getChannels(token);

      if (!active.current) return;
      setChannels(data);
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

  // ── create ───────────────────────────────────────────────────────────────────
  const create = useCallback(
    async (input: CreateChannelInput): Promise<boolean> => {
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

        await createChannel(token, input);
        reload();
        addToast({ type: 'success', message: 'Canal creado' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo crear el canal. Por favor intenta de nuevo.';
        setCreateError(message);
        addToast({ type: 'error', message });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [reload, addToast],
  );

  // ── update ───────────────────────────────────────────────────────────────────
  const update = useCallback(
    async (id: string, input: UpdateChannelInput): Promise<boolean> => {
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

        await updateChannel(token, id, input);
        reload();
        addToast({ type: 'success', message: 'Canal actualizado' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar el canal. Por favor intenta de nuevo.';
        setUpdateError(message);
        addToast({ type: 'error', message });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [reload, addToast],
  );

  return { channels, isLoading, isError, error, reload, create, isCreating, createError, update, isUpdating, updateError };
}
