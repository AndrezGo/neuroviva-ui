'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { routes } from '@/core/routing/routes';

interface UseSignOutReturn {
  signOut: () => Promise<void>;
  isLoading: boolean;
}

export function useSignOut(): UseSignOutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  const signOut = useCallback(async () => {
    setIsLoading(true);
    await supabaseAuthRepository.signOut();
    clear();
    router.replace(routes.login());
  }, [clear, router]);

  return { signOut, isLoading };
}
