'use client';

import { useState, useEffect, useRef } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { lookupPatientByDocument } from '@/infrastructure/api/patientApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import type { PatientLookupResult } from '@/domain/patient/patient.types';

export type PatientLookupStatus = 'idle' | 'searching' | 'found' | 'not-found' | 'error';

export interface UsePatientLookupReturn {
  status: PatientLookupStatus;
  patient: PatientLookupResult | null;
  errorMessage: string | null;
}

const MIN_LENGTH = 3;
const DEBOUNCE_MS = 500;

/**
 * Debounced patient lookup hook.
 * Triggers an API search after ~500ms of inactivity once documentNumber
 * reaches the minimum length. Handles 404 (not-found) vs other errors.
 */
export function usePatientLookup(documentNumber: string): UsePatientLookupReturn {
  const [status, setStatus] = useState<PatientLookupStatus>('idle');
  const [patient, setPatient] = useState<PatientLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tracks whether the latest async lookup result should still be applied
  const activeRef = useRef(true);

  useEffect(() => {
    const trimmed = documentNumber.trim();

    if (trimmed.length < MIN_LENGTH) {
      setStatus('idle');
      setPatient(null);
      setErrorMessage(null);
      return;
    }

    setStatus('searching');

    const timerId = setTimeout(async () => {
      activeRef.current = true;

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!activeRef.current) return;

        if (!token) {
          setStatus('error');
          setErrorMessage('Tu sesión expiró. Inicia sesión de nuevo.');
          return;
        }

        const result = await lookupPatientByDocument(token, trimmed);

        if (!activeRef.current) return;

        setPatient(result);
        setStatus('found');
        setErrorMessage(null);
      } catch (err) {
        if (!activeRef.current) return;

        if (err instanceof ApiError && err.status === 404) {
          setStatus('not-found');
          setPatient(null);
          setErrorMessage(null);
        } else if (err instanceof ApiError) {
          setStatus('error');
          setPatient(null);
          setErrorMessage(err.message);
        } else {
          setStatus('error');
          setPatient(null);
          setErrorMessage('Ocurrió un error inesperado. Por favor intenta de nuevo.');
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      activeRef.current = false;
      clearTimeout(timerId);
    };
  }, [documentNumber]);

  return { status, patient, errorMessage };
}
