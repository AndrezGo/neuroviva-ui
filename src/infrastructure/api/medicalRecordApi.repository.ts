'use client';

import { apiRequest } from './apiClient';
import type {
  ClinicalRecordDto,
  UploadExamInput,
  UploadRecordResult,
  UploadClinicalNoteInput,
  FollowUpEvent,
} from '@/domain/medical-record/medicalRecord.types';

/**
 * Fetches the list of exam records for a patient.
 */
export async function getExams(
  token: string,
  patientId: string,
): Promise<ClinicalRecordDto[]> {
  return apiRequest<ClinicalRecordDto[]>(`/api/v1/patients/${patientId}/exams`, {
    method: 'GET',
    token,
  });
}

/**
 * Uploads a new exam record (multipart) for a patient.
 * Multiple files are appended under the 'attachments' key.
 */
export async function uploadExam(
  token: string,
  patientId: string,
  input: UploadExamInput,
): Promise<UploadRecordResult> {
  const formData = new FormData();
  formData.append('description', input.description);
  if (input.eventDate) formData.append('eventDate', input.eventDate);
  for (const f of input.attachments) {
    formData.append('attachments', f);
  }

  return apiRequest<UploadRecordResult>(`/api/v1/patients/${patientId}/exams`, {
    method: 'POST',
    token,
    body: formData,
  });
}

/**
 * Fetches the list of clinical note records for a patient.
 */
export async function getClinicalNotes(
  token: string,
  patientId: string,
): Promise<ClinicalRecordDto[]> {
  return apiRequest<ClinicalRecordDto[]>(`/api/v1/patients/${patientId}/clinical-notes`, {
    method: 'GET',
    token,
  });
}

/**
 * Uploads a new clinical note record (multipart) for a patient.
 */
export async function uploadClinicalNote(
  token: string,
  patientId: string,
  input: UploadClinicalNoteInput,
): Promise<UploadRecordResult> {
  const formData = new FormData();
  formData.append('eventType', input.eventType);
  formData.append('description', input.description);
  if (input.eventDate) formData.append('eventDate', input.eventDate);
  for (const f of input.attachments) {
    formData.append('attachments', f);
  }

  return apiRequest<UploadRecordResult>(`/api/v1/patients/${patientId}/clinical-notes`, {
    method: 'POST',
    token,
    body: formData,
  });
}

/**
 * Fetches the follow-up event timeline for a patient.
 */
export async function getFollowUp(
  token: string,
  patientId: string,
): Promise<FollowUpEvent[]> {
  return apiRequest<FollowUpEvent[]>(`/api/v1/patients/${patientId}/follow-up`, {
    method: 'GET',
    token,
  });
}
