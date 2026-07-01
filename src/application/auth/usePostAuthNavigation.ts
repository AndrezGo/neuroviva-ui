'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { syncUser } from '@/infrastructure/api/userApi.repository';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { routes, getHomeByRole } from '@/core/routing/routes';

interface UsePostAuthNavigationReturn {
  /** Call after a successful OAuth exchange or any server-side sign-in to sync roles and navigate. */
  run: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Encapsulates the post-authentication orchestration that is shared between
 * email/password sign-in and the OAuth callback landing page:
 *   1. Reads the active Supabase access token.
 *   2. Syncs the user with the .NET backend to retrieve roles and profile.
 *   3. Updates the Zustand auth store.
 *   4. Navigates to the role-specific home, or to role-selection if no role is set.
 *
 * Using router.replace (not push) because the callback URL should not sit in
 * the browser history — the user should not be able to go "back" to it.
 */
export function usePostAuthNavigation(): UsePostAuthNavigationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBackendUser = useAuthStore((s) => s.setBackendUser);
  const router = useRouter();

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        setError('No se encontró una sesión activa. Por favor inicia sesión de nuevo.');
        setIsLoading(false);
        router.replace(routes.login());
        return;
      }

      // Persist a minimal session in the store so downstream consumers have a token.
      // A full AuthSession is not available here (we only have the access token);
      // the store already persists the user object from the OAuth sign-in via Supabase cookies.
      // We only call setSession when a full session object is available (see useSignIn).
      // Here we rely on the store's persisted user and only update backendUser.

      try {
        const storedUser = useAuthStore.getState().user;
        const backendUser = await syncUser(token, { name: storedUser?.fullName });
        setBackendUser(backendUser);

        if (backendUser.roles.length > 0) {
          router.replace(getHomeByRole(backendUser.roles[0]));
        } else {
          router.replace(routes.roleSelection());
        }
      } catch {
        // Backend unreachable — still let the user pick a role rather than blocking.
        router.replace(routes.roleSelection());
      }
    } finally {
      setIsLoading(false);
    }
  }, [setBackendUser, router]);

  return { run, isLoading, error };
}
