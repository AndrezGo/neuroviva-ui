'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getDoctorAlerts,
  markAlertSeen,
  resolveAlert,
} from '@/infrastructure/api/doctorApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { DoctorAlert } from '@/domain/doctor/doctor.types';

export interface UseDoctorAlertsReturn {
  alerts: DoctorAlert[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  markSeen: (id: string) => Promise<void>;
  resolve: (id: string) => Promise<void>;
}

/**
 * Fetches and manages the doctor's smart alerts.
 * Provides optimistic updates for markSeen and resolve actions,
 * resyncing from the server on any error to avoid stale state.
 */
export function useDoctorAlerts(): UseDoctorAlertsReturn {
  const [alerts, setAlerts] = useState<DoctorAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setAlerts([]);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getDoctorAlerts(token, false);

      if (!active.current) return;

      setAlerts(data);
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

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const active = { current: true };
    fetchData(active);
    return () => {
      active.current = false;
    };
  }, [fetchData, reloadKey]);

  const markSeen = useCallback(
    async (id: string) => {
      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setIsError(true);
          setError('Tu sesión expiró. Inicia sesión de nuevo.');
          return;
        }

        await markAlertSeen(token, id);
        // Optimistic update — mark as seen without re-fetching
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, seen: true } : a)),
        );
      } catch {
        // On error, resync from server to avoid stale optimistic state
        reload();
      }
    },
    [reload],
  );

  const resolve = useCallback(
    async (id: string) => {
      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setIsError(true);
          setError('Tu sesión expiró. Inicia sesión de nuevo.');
          return;
        }

        await resolveAlert(token, id);
        // Optimistic update — remove the alert from the list
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      } catch {
        // On error, resync from server to avoid stale optimistic state
        reload();
      }
    },
    [reload],
  );

  return { alerts, isLoading, isError, error, reload, markSeen, resolve };
}
