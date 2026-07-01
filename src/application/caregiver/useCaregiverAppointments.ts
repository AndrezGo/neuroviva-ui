'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getAppointments,
  createAppointment as createAppointmentRepo,
  cancelAppointment as cancelAppointmentRepo,
} from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { Appointment, CreateAppointmentInput } from '@/domain/caregiver/caregiver.types';
import type { AppointmentFormValues } from './caregiverSchemas';

export interface UseCaregiverAppointmentsReturn {
  appointments: Appointment[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  createAppointment: (input: AppointmentFormValues) => Promise<boolean>;
  isCreating: boolean;
  createError: string | null;
  cancelAppointment: (id: string) => Promise<boolean>;
  isCancelling: boolean;
  cancelError: string | null;
}

/**
 * Orchestrates fetching and creating appointments for the Caregiver Agenda screen.
 * Mirrors the pattern established in useCaregiverHome.
 */
export function useCaregiverAppointments(): UseCaregiverAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setAppointments([]);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError('Tu sesión expiró. Inicia sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const data = await getAppointments(token);

      if (!active.current) return;
      setAppointments(data);
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

  const createAppointment = useCallback(
    async (input: AppointmentFormValues): Promise<boolean> => {
      setIsCreating(true);
      setCreateError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setCreateError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        // Convert the datetime-local value (e.g. "2024-06-15T10:30") to ISO8601.
        const payload: CreateAppointmentInput = {
          title: input.title,
          type: input.type,
          scheduledAt: new Date(input.scheduledAt).toISOString(),
          notes: input.notes || undefined,
        };

        await createAppointmentRepo(token, payload);
        reload();
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo guardar la cita. Por favor intenta de nuevo.';
        setCreateError(message);
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [reload],
  );

  const cancelAppointment = useCallback(
    async (id: string): Promise<boolean> => {
      setIsCancelling(true);
      setCancelError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setCancelError('Tu sesión expiró. Inicia sesión de nuevo.');
          return false;
        }

        await cancelAppointmentRepo(token, id);
        reload();
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo cancelar la cita. Por favor intenta de nuevo.';
        setCancelError(message);
        return false;
      } finally {
        setIsCancelling(false);
      }
    },
    [reload],
  );

  return {
    appointments,
    isLoading,
    isError,
    error,
    reload,
    createAppointment,
    isCreating,
    createError,
    cancelAppointment,
    isCancelling,
    cancelError,
  };
}
