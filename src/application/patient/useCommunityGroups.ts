'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getMyGroups } from '@/infrastructure/api/communityApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { CommunityGroup } from '@/domain/community/community.types';

export interface UseCommunityGroupsReturn {
  groups: CommunityGroup[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetches the authenticated patient's community groups on mount.
 *
 * NOTE: The backend transparently auto-joins the patient to groups that match their
 * condition when this endpoint is called — there is no separate join action required.
 *
 * Mirrors the fetch pattern from usePatientFeed: manual loading/error state,
 * active-ref cancellation guard, ApiError normalization.
 */
export function useCommunityGroups(): UseCommunityGroupsReturn {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setGroups([]);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getMyGroups(token);

      if (!active.current) return;
      setGroups(data);
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

  return { groups, isLoading, isError, error, reload };
}
