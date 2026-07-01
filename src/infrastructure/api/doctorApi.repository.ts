'use client';

import { apiRequest, ApiError } from './apiClient';
import type {
  DoctorPatient,
  DoctorAlert,
  LookupDoctorResult,
  DoctorListItem,
  PatientDoctor,
} from '@/domain/doctor/doctor.types';

const BASE = '/api/v1/doctor';

/**
 * Fetches the list of patients assigned to the authenticated doctor.
 */
export async function getDoctorPatients(token: string): Promise<DoctorPatient[]> {
  return apiRequest<DoctorPatient[]>(`${BASE}/patients`, {
    method: 'GET',
    token,
  });
}

/**
 * Fetches the doctor's smart alerts.
 * Pass `includeResolved = true` to also retrieve already-resolved alerts.
 */
export async function getDoctorAlerts(
  token: string,
  includeResolved = false,
): Promise<DoctorAlert[]> {
  return apiRequest<DoctorAlert[]>(
    `${BASE}/alerts?includeResolved=${includeResolved}`,
    { method: 'GET', token },
  );
}

/**
 * Marks a specific alert as seen by the doctor.
 * Returns 204 No Content on success.
 */
export async function markAlertSeen(token: string, alertId: string): Promise<void> {
  await apiRequest<void>(`${BASE}/alerts/${alertId}/seen`, {
    method: 'PATCH',
    token,
  });
}

/**
 * Resolves (dismisses) a specific alert, removing it from the active list.
 * Returns 204 No Content on success.
 */
export async function resolveAlert(token: string, alertId: string): Promise<void> {
  await apiRequest<void>(`${BASE}/alerts/${alertId}/resolve`, {
    method: 'PATCH',
    token,
  });
}

/**
 * Looks up a doctor by their medical license number.
 * Used by the caregiver flow to assign a doctor to a patient.
 */
export async function lookupDoctor(
  token: string,
  medicalLicense: string,
): Promise<LookupDoctorResult> {
  return apiRequest<LookupDoctorResult>(
    `${BASE}/lookup?medicalLicense=${encodeURIComponent(medicalLicense)}`,
    { method: 'GET', token },
  );
}

/**
 * Fetches the full list of registered doctors available for assignment.
 * Used by the caregiver flow to let caregivers select a treating doctor.
 */
export async function getDoctors(token: string): Promise<DoctorListItem[]> {
  return apiRequest<DoctorListItem[]>(BASE, { method: 'GET', token });
}

/**
 * Fetches the doctor currently assigned to the caregiver's linked patient.
 * Returns null if no doctor has been assigned yet (404 is handled silently).
 */
export async function getPatientDoctor(token: string): Promise<PatientDoctor | null> {
  try {
    return await apiRequest<PatientDoctor | null>('/api/v1/caregiver/patient/doctor', {
      method: 'GET',
      token,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
