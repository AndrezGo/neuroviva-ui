'use client';

import { useCallback, useState } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { usePostAuthNavigation } from '@/application/auth/usePostAuthNavigation';
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

  // Shared post-auth orchestration: syncs with backend and navigates by role.
  const { run: runPostAuthNavigation, isLoading: isNavigating } = usePostAuthNavigation();

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

      // Persist the full session (tokens + user) before navigating.
      setSession(result.data);

      // Delegate sync + navigation to the shared hook — no logic duplication.
      await runPostAuthNavigation();

      setIsLoading(false);
    },
    [setSession, runPostAuthNavigation],
  );

  return { signIn, isLoading: isLoading || isNavigating, error };
}
