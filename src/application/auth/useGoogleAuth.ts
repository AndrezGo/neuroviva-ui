'use client';

import { useCallback, useState } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';

interface UseGoogleAuthReturn {
  signInWithGoogle: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await supabaseAuthRepository.signInWithGoogle();

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    // OAuth redirects — loading state remains until redirect
  }, []);

  return { signInWithGoogle, isLoading, error };
}
