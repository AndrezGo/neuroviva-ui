'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getMedicationLogs } from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { MedicationLog } from '@/domain/caregiver/caregiver.types';

export function useMedicationLogs(medicationId: string) {
  const backendUser = useAuthStore((s) => s.backendUser);

  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const activeRef = useRef(false);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!backendUser) return;

    activeRef.current = true;
    setIsLoading(true);
    setIsError(false);
    setError(null);

    (async () => {
      try {
        const token = await supabaseAuthRepository.getAccessToken();
        if (!token || !activeRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await getMedicationLogs(token, medicationId) as any[];
        if (!activeRef.current) return;

        // Map backend casing variants to the domain type
        const mapped: MedicationLog[] = raw.map((r) => ({
          id: r.id ?? r.Id,
          takenAt: r.loggedAt ?? r.LoggedAt ?? r.takenAt ?? r.TakenAt,
          notes: r.notes ?? r.Notes ?? null,
        }));

        setLogs(mapped);
      } catch (err) {
        if (!activeRef.current) return;
        setIsError(true);
        setError(
          err instanceof ApiError ? err.message : 'Error al cargar el historial',
        );
      } finally {
        if (activeRef.current) setIsLoading(false);
      }
    })();

    return () => {
      activeRef.current = false;
    };
  }, [medicationId, reloadKey, backendUser]);

  return { logs, isLoading, isError, error, reload };
}
