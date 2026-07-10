'use client';

import { useState, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { createGroup } from '@/infrastructure/api/communityApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useToastStore } from '@/shared/store/useToastStore';
import type { CreateGroupInput } from '@/domain/community/community.types';

export interface UseCreateGroupReturn {
  /** Calls the backend to create a group. Returns true on success, false on failure. */
  create: (input: CreateGroupInput) => Promise<boolean>;
  isCreating: boolean;
  /** Validation/API error from the most recent create call, or null. */
  createError: string | null;
}

/**
 * Provides a `create` action for posting a new community group via the curator endpoint.
 * Mirrors the create pattern in useCuratorResources: token guard, ApiError handling,
 * and success/error toasts via useToastStore.
 */
export function useCreateGroup(): UseCreateGroupReturn {
  const addToast = useToastStore((s) => s.addToast);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const create = useCallback(
    async (input: CreateGroupInput): Promise<boolean> => {
      setIsCreating(true);
      setCreateError(null);

      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          const msg = 'Tu sesión expiró. Inicia sesión de nuevo.';
          setCreateError(msg);
          addToast({ type: 'error', message: msg });
          return false;
        }

        await createGroup(token, input);
        addToast({ type: 'success', message: 'Grupo creado' });
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'No se pudo crear el grupo. Por favor intenta de nuevo.';
        setCreateError(message);
        addToast({ type: 'error', message });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [addToast],
  );

  return { create, isCreating, createError };
}
