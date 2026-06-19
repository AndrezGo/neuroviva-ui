'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { syncUser } from '@/infrastructure/api/userApi.repository';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { routes } from '@/core/routing/routes';
import type { SignUpInput } from '@/domain/auth/auth.types';

interface UseSignUpReturn {
  signUp: (input: SignUpInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useSignUp(): UseSignUpReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const setBackendUser = useAuthStore((s) => s.setBackendUser);
  const router = useRouter();

  const signUp = useCallback(
    async (input: SignUpInput) => {
      setIsLoading(true);
      setError(null);

      const result = await supabaseAuthRepository.signUp(input);

      if (!result.ok) {
        setError(result.message);
        setIsLoading(false);
        return;
      }

      setSession(result.data);

      // If Supabase returned a session (email confirmation not required), sync with the backend.
      // If email confirmation IS required, accessToken will be empty — skip sync and let the
      // user confirm their email before proceeding.
      if (result.data.accessToken) {
        try {
          const backendUser = await syncUser(result.data.accessToken, {
            name: input.fullName,
          });
          setBackendUser(backendUser);
        } catch {
          // Backend sync failure is non-fatal for registration — user will be synced on next login.
          console.error('[SignUp] Backend sync failed — user will be synced on next login.');
        }
      }

      // New users always go to role selection
      router.push(routes.roleSelection());
    },
    [setSession, setBackendUser, router],
  );

  return { signUp, isLoading, error };
}
