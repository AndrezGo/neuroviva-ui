'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getDoctors, getPatientDoctor } from '@/infrastructure/api/doctorApi.repository';
import { assignDoctorToPatient } from '@/infrastructure/api/caregiverApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { DoctorListItem, PatientDoctor } from '@/domain/doctor/doctor.types';

export interface UseAssignDoctorReturn {
  doctors: DoctorListItem[];
  currentDoctor: PatientDoctor | null;
  isLoading: boolean;
  isAssigning: boolean;
  isError: boolean;
  error: string | null;
  assignError: string | null;
  assignDoctor: (doctorId: string) => Promise<void>;
  reload: () => void;
}

const SESSION_EXPIRED_MSG = 'Tu sesión expiró. Inicia sesión de nuevo.';

/**
 * Orchestrates the fetch of all available doctors and the patient's currently
 * assigned doctor, and exposes an `assignDoctor` action.
 *
 * Error-handling mirrors the pattern in useCaregiverPatient:
 *  - no-token / 401  → session-expired message
 *  - 403             → role-sync message
 *  - other ApiError  → err.message
 *  - unexpected      → generic message
 *
 * `assignDoctor` updates `currentDoctor` locally on success (no refetch).
 */
export function useAssignDoctor(): UseAssignDoctorReturn {
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<PatientDoctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const fetchData = useCallback(async (active: { current: boolean }) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setDoctors([]);
    setCurrentDoctor(null);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        if (!active.current) return;
        setIsError(true);
        setError(SESSION_EXPIRED_MSG);
        setIsLoading(false);
        return;
      }

      const [doctorList, patientDoctor] = await Promise.all([
        getDoctors(token),
        getPatientDoctor(token),
      ]);

      if (!active.current) return;
      setDoctors(doctorList);
      setCurrentDoctor(patientDoctor);
    } catch (err) {
      if (!active.current) return;

      if (err instanceof ApiError && err.status === 401) {
        setIsError(true);
        setError(SESSION_EXPIRED_MSG);
      } else if (err instanceof ApiError && err.status === 403) {
        setIsError(true);
        setError(
          'Para continuar, cierra sesión e inicia de nuevo. Tu perfil de cuidador necesita actualizarse.',
        );
      } else if (err instanceof ApiError) {
        setIsError(true);
        setError(err.message);
      } else {
        setIsError(true);
        setError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      }
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

  const assignDoctor = useCallback(
    async (doctorId: string) => {
      setIsAssigning(true);
      setAssignError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          setAssignError(SESSION_EXPIRED_MSG);
          return;
        }

        await assignDoctorToPatient(token, doctorId);

        // Update currentDoctor locally by finding the selected doctor in the list.
        const found = doctors.find((d) => d.doctorId === doctorId);
        if (found) {
          setCurrentDoctor({
            doctorId: found.doctorId,
            name: found.name,
            specialty: found.specialty,
            medicalLicense: found.medicalLicense,
          });
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setAssignError(err.message);
        } else {
          setAssignError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
        }
      } finally {
        setIsAssigning(false);
      }
    },
    [doctors],
  );

  return {
    doctors,
    currentDoctor,
    isLoading,
    isAssigning,
    isError,
    error,
    assignError,
    assignDoctor,
    reload,
  };
}
