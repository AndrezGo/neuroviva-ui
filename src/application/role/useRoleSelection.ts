'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { assignRole } from '@/infrastructure/api/userApi.repository';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { toBackendRole } from '@/domain/user/roleMapper';
import { routes, getPostRoleRoute } from '@/core/routing/routes';
import type { UserRole } from '@/domain/auth/auth.types';

interface UseRoleSelectionReturn {
  selectedRole: UserRole | null;
  selectRole: (role: UserRole) => void;
  confirm: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useRoleSelection(): UseRoleSelectionReturn {
  const storeRole = useAuthStore((s) => s.selectedRole);
  const setRole = useAuthStore((s) => s.setRole);
  const setBackendUser = useAuthStore((s) => s.setBackendUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const selectRole = useCallback(
    (role: UserRole) => {
      setRole(role);
    },
    [setRole],
  );

  const confirm = useCallback(async () => {
    if (!storeRole) return;

    setIsLoading(true);
    setError(null);

    try {
      // Retrieve the current access token for authenticated backend call
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        // Session expired — redirect to login
        router.push(routes.login());
        return;
      }

      const backendRoleName = toBackendRole(storeRole);
      const updatedUser = await assignRole(token, backendRoleName);

      setBackendUser(updatedUser);
      router.push(getPostRoleRoute(backendRoleName));
    } catch (err) {
      setError('Error al guardar tu rol. Intenta de nuevo.');
      console.error('[RoleSelection] assignRole failed:', err instanceof Error ? err.message : err);
    } finally {
      setIsLoading(false);
    }
  }, [storeRole, setBackendUser, router]);

  return { selectedRole: storeRole, selectRole, confirm, isLoading, error };
}
