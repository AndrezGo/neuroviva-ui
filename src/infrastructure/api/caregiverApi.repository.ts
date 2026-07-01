'use client';

import { apiRequest } from './apiClient';
import type {
  CaregiverPatient,
  CaregiverToday,
  CaregiverOnboardingPayload,
  CaregiverOnboardingResult,
  Medication,
  CreateMedicationInput,
  CreateMedicationResult,
  LogMedicationInput,
  LogMedicationResult,
  MedicationLog,
  Appointment,
  CreateAppointmentInput,
  CreateAppointmentResult,
  AppointmentOutcome,
  Symptom,
  CreateSymptomPayload,
  HistoryEvent,
  CreateHistoryNoteInput,
  CreateHistoryNoteResult,
  AppNotification,
} from '@/domain/caregiver/caregiver.types';

/**
 * Fetches the caregiver's linked patient profile from the backend.
 * Throws ApiError with status 404 if no patient has been linked yet.
 */
export async function getCaregiverPatient(token: string): Promise<CaregiverPatient> {
  return apiRequest<CaregiverPatient>('/api/v1/caregiver/patient', {
    method: 'GET',
    token,
  });
}

/**
 * Fetches today's medications and appointments for the caregiver's patient.
 * Returns empty arrays if nothing is scheduled.
 */
export async function getCaregiverToday(token: string): Promise<CaregiverToday> {
  return apiRequest<CaregiverToday>('/api/v1/caregiver/today', {
    method: 'GET',
    token,
  });
}

/**
 * Submits the caregiver onboarding form data to the backend,
 * creating the patient record and linking it to the caregiver.
 */
export async function submitCaregiverOnboarding(
  token: string,
  payload: CaregiverOnboardingPayload,
): Promise<CaregiverOnboardingResult> {
  return apiRequest<CaregiverOnboardingResult>('/api/v1/caregiver/onboarding', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// ── Medications ──────────────────────────────────────────────────────────────

/**
 * Fetches the full list of medications registered for the caregiver's patient.
 */
export async function getMedications(token: string): Promise<Medication[]> {
  return apiRequest<Medication[]>('/api/v1/caregiver/medications', {
    method: 'GET',
    token,
  });
}

/**
 * Creates a new medication record for the caregiver's patient.
 */
export async function createMedication(
  token: string,
  input: CreateMedicationInput,
): Promise<CreateMedicationResult> {
  return apiRequest<CreateMedicationResult>('/api/v1/caregiver/medications', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Logs a medication intake event for a specific medication.
 */
export async function logMedication(
  token: string,
  id: string,
  input: LogMedicationInput,
): Promise<LogMedicationResult> {
  return apiRequest<LogMedicationResult>(`/api/v1/caregiver/medications/${id}/log`, {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Fetches the intake log history for a specific medication.
 * Returns the raw server response; key mapping is handled in the hook.
 */
export async function getMedicationLogs(
  token: string,
  medicationId: string,
): Promise<MedicationLog[]> {
  return apiRequest<MedicationLog[]>(
    `/api/v1/caregiver/medications/${medicationId}/logs`,
    { method: 'GET', token },
  );
}

// ── Appointments ─────────────────────────────────────────────────────────────

/**
 * Fetches the full list of appointments for the caregiver's patient.
 */
export async function getAppointments(token: string): Promise<Appointment[]> {
  return apiRequest<Appointment[]>('/api/v1/caregiver/appointments', {
    method: 'GET',
    token,
  });
}

/**
 * Creates a new appointment for the caregiver's patient.
 */
export async function createAppointment(
  token: string,
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  return apiRequest<CreateAppointmentResult>('/api/v1/caregiver/appointments', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Cancels a scheduled or confirmed appointment.
 * Returns 204 No Content on success.
 */
export async function cancelAppointment(token: string, id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/caregiver/appointments/${id}/cancel`, {
    method: 'PATCH',
    token,
  });
}

/**
 * Records the final outcome for a past appointment.
 * Returns 204 No Content on success.
 */
export async function recordAppointmentOutcome(
  token: string,
  id: string,
  outcome: AppointmentOutcome,
): Promise<void> {
  await apiRequest<void>(`/api/v1/caregiver/appointments/${id}/outcome`, {
    method: 'PATCH',
    body: JSON.stringify({ outcome }),
    token,
  });
}

// ── Symptoms ──────────────────────────────────────────────────────────────────

export async function listSymptoms(token: string): Promise<Symptom[]> {
  return apiRequest<Symptom[]>('/api/v1/caregiver/symptoms', {
    method: 'GET',
    token,
  });
}

export async function registerSymptom(
  token: string,
  payload: CreateSymptomPayload,
): Promise<Symptom> {
  return apiRequest<Symptom>('/api/v1/caregiver/symptoms', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// ── Clinical History ──────────────────────────────────────────────────────────

export async function getClinicalHistory(token: string): Promise<HistoryEvent[]> {
  return apiRequest<HistoryEvent[]>('/api/v1/caregiver/history', { method: 'GET', token });
}

export async function addHistoryNote(
  token: string,
  input: CreateHistoryNoteInput,
): Promise<CreateHistoryNoteResult> {
  return apiRequest<CreateHistoryNoteResult>('/api/v1/caregiver/history', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function getNotifications(token: string): Promise<AppNotification[]> {
  return apiRequest<AppNotification[]>('/api/v1/caregiver/notifications', {
    method: 'GET',
    token,
  });
}

export async function markNotificationRead(token: string, id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/caregiver/notifications/${id}/read`, {
    method: 'PATCH',
    token,
  });
}

// ── Doctor assignment ─────────────────────────────────────────────────────────

/**
 * Assigns a doctor to the caregiver's linked patient by doctor ID.
 * Returns 204 No Content on success.
 */
export async function assignDoctorToPatient(token: string, doctorId: string): Promise<void> {
  await apiRequest<void>('/api/v1/caregiver/patient/doctor', {
    method: 'POST',
    token,
    body: JSON.stringify({ doctorId }),
  });
}
