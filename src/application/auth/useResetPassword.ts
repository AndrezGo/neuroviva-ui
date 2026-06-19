'use client';

import { useCallback, useState } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import type { ResetPasswordInput } from '@/domain/auth/auth.types';

interface UseResetPasswordReturn {
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useResetPassword(): UseResetPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await supabaseAuthRepository.resetPassword(input);

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  }, []);

  return { resetPassword, isLoading, error, success };
}
