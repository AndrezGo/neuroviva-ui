'use client';

import { apiRequest } from './apiClient';
import type {
  PatientLookupResult,
  PatientOnboardingPayload,
  PatientProfile,
} from '@/domain/patient/patient.types';

/**
 * Looks up a patient by document number.
 * Throws ApiError with status 404 if no patient exists with that document.
 */
export async function lookupPatientByDocument(
  token: string,
  documentNumber: string,
): Promise<PatientLookupResult> {
  return apiRequest<PatientLookupResult>(
    `/api/v1/caregiver/patient/lookup?documentNumber=${encodeURIComponent(documentNumber)}`,
    { method: 'GET', token },
  );
}

/**
 * Submits the patient's onboarding data to link their account to their profile.
 */
export async function submitPatientOnboarding(
  token: string,
  payload: PatientOnboardingPayload,
): Promise<void> {
  await apiRequest<void>('/api/v1/patient/claim', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

/**
 * Fetches the authenticated patient's profile.
 */
export async function getPatientProfile(token: string): Promise<PatientProfile> {
  return apiRequest<PatientProfile>('/api/v1/patient/profile', {
    method: 'GET',
    token,
  });
}
