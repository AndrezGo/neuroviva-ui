'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getPatientResources } from '@/infrastructure/api/contentApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { PatientResource, ResourceRequestType } from '@/domain/content/content.types';

export interface UsePatientFeedReturn {
  resources: PatientResource[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetches the patient content feed for a given resource type.
 * Switching `type`, `lang`, or `channelId` triggers a fresh fetch (all are dependencies).
 * `lang` is optional; when omitted no lang query param is sent (backend defaults to 'es').
 * `channelId` is optional; when provided only videos from that channel are returned.
 * Only meaningful for scientific_article/video — news callers can omit both safely.
 * Mirrors the fetch pattern from useCaregiverSymptoms.
 */
export function usePatientFeed(type: ResourceRequestType, lang?: 'es' | 'en', channelId?: string): UsePatientFeedReturn {
  const [resources, setResources] = useState<PatientResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(
    async (active: { current: boolean }) => {
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

        const data = await getPatientResources(token, type, lang, channelId);

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
    },
    [type, lang, channelId],
  );

  useEffect(() => {
    const active = { current: true };
    fetchData(active);
    return () => {
      active.current = false;
    };
  }, [fetchData, reloadKey]);

  return { resources, isLoading, isError, error, reload };
}
