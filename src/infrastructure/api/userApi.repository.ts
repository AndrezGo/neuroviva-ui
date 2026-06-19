'use client';

import { apiRequest } from './apiClient';
import type { BackendUser, BackendRoleName } from '@/domain/user/user.types';

/**
 * Syncs the authenticated user with the .NET backend after Supabase login/signup.
 * The backend creates the user record on first call and returns the current profile.
 */
export async function syncUser(
  token: string,
  opts?: { name?: string },
): Promise<BackendUser> {
  return apiRequest<BackendUser>('/api/v1/users/sync', {
    method: 'POST',
    token,
    body: JSON.stringify({ name: opts?.name ?? undefined }),
  });
}

/**
 * Fetches the authenticated user's profile from the backend.
 */
export async function getMe(token: string): Promise<BackendUser> {
  return apiRequest<BackendUser>('/api/v1/users/me', {
    method: 'GET',
    token,
  });
}

/**
 * Assigns a role to the authenticated user.
 * Returns the updated user profile.
 */
export async function assignRole(
  token: string,
  roleName: BackendRoleName,
): Promise<BackendUser> {
  return apiRequest<BackendUser>('/api/v1/users/me/role', {
    method: 'POST',
    token,
    body: JSON.stringify({ roleName }),
  });
}
