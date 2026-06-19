'use client';

import { useCallback } from 'react';
import { syncUser } from '@/infrastructure/api/userApi.repository';
import { useAuthStore } from '@/shared/store/useAuthStore';
import type { BackendUser } from '@/domain/user/user.types';

interface PostAuthSyncOptions {
  /** Display name to register on first sync (used during sign-up). */
  name?: string;
}

interface UsePostAuthSyncReturn {
  /**
   * Calls the backend sync endpoint with the Supabase access token.
   * Stores the returned BackendUser in the auth store.
   * Returns the user on success, or null if the sync fails.
   */
  sync: (accessToken: string, opts?: PostAuthSyncOptions) => Promise<BackendUser | null>;
}

export function usePostAuthSync(): UsePostAuthSyncReturn {
  const setBackendUser = useAuthStore((s) => s.setBackendUser);

  const sync = useCallback(
    async (accessToken: string, opts?: PostAuthSyncOptions): Promise<BackendUser | null> => {
      try {
        const user = await syncUser(accessToken, { name: opts?.name });
        setBackendUser(user);
        return user;
      } catch (err) {
        // Log without exposing the token
        console.error('[PostAuthSync] Backend sync failed:', err instanceof Error ? err.message : err);
        return null;
      }
    },
    [setBackendUser],
  );

  return { sync };
}
