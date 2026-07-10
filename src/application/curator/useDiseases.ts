'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getDiseases } from '@/infrastructure/api/contentApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { Disease } from '@/domain/content/content.types';

export interface UseDiseasesReturn {
  diseases: Disease[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetches the full list of diseases once on mount for use in curation selectors.
 * Follows the same fetch/cleanup pattern as useCuratorResources.
 */
export function useDiseases(): UseDiseasesReturn {
  const [diseases, setDiseases] = useState<Disease[]>([]);
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
    setDiseases([]);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getDiseases(token);

      if (!active.current) return;
      setDiseases(data);
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

  return { diseases, isLoading, isError, error, reload };
}
