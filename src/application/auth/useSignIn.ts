'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { syncUser } from '@/infrastructure/api/userApi.repository';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { routes, getHomeByRole } from '@/core/routing/routes';
import type { SignInInput } from '@/domain/auth/auth.types';

interface UseSignInReturn {
  signIn: (input: SignInInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useSignIn(): UseSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const setBackendUser = useAuthStore((s) => s.setBackendUser);
  const router = useRouter();

  const signIn = useCallback(
    async (input: SignInInput) => {
      setIsLoading(true);
      setError(null);

      const result = await supabaseAuthRepository.signIn(input);

      if (!result.ok) {
        setError(result.message);
        setIsLoading(false);
        return;
      }

      setSession(result.data);

      // Sync with the .NET backend to retrieve roles and profile
      try {
        const backendUser = await syncUser(result.data.accessToken);
        setBackendUser(backendUser);

        if (backendUser.roles.length > 0) {
          // User already has a role — navigate to the role-specific home
          router.push(getHomeByRole(backendUser.roles[0]));
        } else {
          // No role yet — let the user pick one
          router.push(routes.roleSelection());
        }
      } catch {
        // Backend is unreachable or returned an error.
        // Still allow the user to proceed to role selection rather than blocking login.
        router.push(routes.roleSelection());
      }
    },
    [setSession, setBackendUser, router],
  );

  return { signIn, isLoading, error };
}
