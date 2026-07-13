'use client';

import { apiRequest } from './apiClient';
import type {
  PatientResource,
  PendingResource,
  CreateResourceInput,
  CreateResourceResult,
  ResourceRequestType,
  Disease,
  Channel,
  CreateChannelInput,
  CreateChannelResult,
  UpdateChannelInput,
  UpdateResourceInput,
  AllResourceItem,
} from '@/domain/content/content.types';

/**
 * Fetches the list of resources for the authenticated patient, filtered by type.
 * Type param uses snake_case (news | scientific_article | video) as required by the backend.
 * Optional `lang` ('es' | 'en') filters results by language; only meaningful for
 * scientific_article — the backend silently ignores it for news and video.
 * Optional `channelId` restricts results to a single channel; only meaningful for
 * video — the backend silently ignores it for other types.
 * When both `lang` and `channelId` are omitted the URL is byte-for-byte identical
 * to the previous `/api/v1/patient/resources?type=${type}`.
 */
export async function getPatientResources(
  token: string,
  type: ResourceRequestType,
  lang?: 'es' | 'en',
  channelId?: string,
): Promise<PatientResource[]> {
  const params = new URLSearchParams({ type });
  if (lang) params.set('lang', lang);
  if (channelId) params.set('channelId', channelId);
  return apiRequest<PatientResource[]>(`/api/v1/patient/resources?${params.toString()}`, {
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

/**
 * Fetches the full list of channels for use in curation selectors.
 * Small cacheable list — no query params needed.
 * Gated by ScientificCommittee policy (same token used by other curator calls).
 */
export async function getChannels(token: string): Promise<Channel[]> {
  return apiRequest<Channel[]>('/api/v1/curator/channels', { method: 'GET', token });
}

/**
 * Creates a new channel.
 * Requires scientific-committee role; throws ApiError(403) otherwise.
 */
export async function createChannel(
  token: string,
  input: CreateChannelInput,
): Promise<CreateChannelResult> {
  return apiRequest<CreateChannelResult>('/api/v1/curator/channels', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Updates an existing channel — full replacement. Returns 204 No Content on success.
 * Requires scientific-committee role; throws ApiError(403) otherwise.
 */
export async function updateChannel(
  token: string,
  id: string,
  input: UpdateChannelInput,
): Promise<void> {
  await apiRequest<void>(`/api/v1/curator/channels/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Updates an existing resource — full replacement. Returns 204 No Content on success.
 * Same field validations as createResource apply.
 * Requires scientific-committee role; throws ApiError(403) otherwise.
 */
export async function updateResource(
  token: string,
  id: string,
  input: UpdateResourceInput,
): Promise<void> {
  await apiRequest<void>(`/api/v1/curator/resources/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}

/**
 * Fetches all resources regardless of approval status.
 * Gated by scientific-committee role (same token used by other curator calls).
 */
export async function getAllResources(token: string): Promise<AllResourceItem[]> {
  return apiRequest<AllResourceItem[]>('/api/v1/curator/resources', {
    method: 'GET',
    token,
  });
}
