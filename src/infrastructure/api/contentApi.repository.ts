'use client';

import { apiRequest } from './apiClient';
import type {
  PatientResource,
  PendingResource,
  CreateResourceInput,
  CreateResourceResult,
  ResourceRequestType,
  Disease,
} from '@/domain/content/content.types';

/**
 * Fetches the list of resources for the authenticated patient, filtered by type.
 * Type param uses snake_case (news | scientific_article | video) as required by the backend.
 */
export async function getPatientResources(
  token: string,
  type: ResourceRequestType,
): Promise<PatientResource[]> {
  return apiRequest<PatientResource[]>(`/api/v1/patient/resources?type=${type}`, {
    method: 'GET',
    token,
  });
}

/**
 * Fetches the list of resources pending curation approval.
 * Requires scientific-committee role; throws ApiError(403) otherwise.
 */
export async function getPendingResources(token: string): Promise<PendingResource[]> {
  return apiRequest<PendingResource[]>('/api/v1/curator/resources/pending', {
    method: 'GET',
    token,
  });
}

/**
 * Creates a new resource in the pending queue.
 * Requires scientific-committee role; throws ApiError(403) otherwise.
 */
export async function createResource(
  token: string,
  input: CreateResourceInput,
): Promise<CreateResourceResult> {
  return apiRequest<CreateResourceResult>('/api/v1/curator/resources', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Approves a pending resource. Returns 204 No Content on success.
 * Requires scientific-committee role; throws ApiError(403) otherwise.
 */
export async function approveResource(token: string, id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/curator/resources/${id}/approve`, {
    method: 'POST',
    token,
  });
}

/**
 * Rejects a pending resource. Returns 204 No Content on success.
 * Requires scientific-committee role; throws ApiError(403) otherwise.
 */
export async function rejectResource(token: string, id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/curator/resources/${id}/reject`, {
    method: 'POST',
    token,
  });
}

/**
 * Fetches the full list of diseases for use in curation selectors.
 * Small cacheable list — no query params needed.
 * Gated by ScientificCommittee policy (same token used by other curator calls).
 */
export async function getDiseases(token: string): Promise<Disease[]> {
  return apiRequest<Disease[]>('/api/v1/curator/diseases', { method: 'GET', token });
}
