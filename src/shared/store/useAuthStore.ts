'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, AuthUser, UserRole } from '@/domain/auth/auth.types';
import type { BackendUser } from '@/domain/user/user.types';

interface AuthStoreState {
  user: AuthUser | null;
  session: AuthSession | null;
  selectedRole: UserRole | null;
  /** Populated after a successful backend sync or role assignment. */
  backendUser: BackendUser | null;
}

interface AuthStoreActions {
  setSession: (session: AuthSession) => void;
  setRole: (role: UserRole) => void;
  setBackendUser: (user: BackendUser | null) => void;
  clear: () => void;
}

type AuthStore = AuthStoreState & AuthStoreActions;

const initialState: AuthStoreState = {
  user: null,
  session: null,
  selectedRole: null,
  backendUser: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSession: (session: AuthSession) =>
        set({ session, user: session.user }),

      setRole: (role: UserRole) =>
        set({ selectedRole: role }),

      setBackendUser: (user: BackendUser | null) =>
        set({ backendUser: user }),

      clear: () => set(initialState),
    }),
    {
      name: 'neuroviva-auth',
      // Only persist non-sensitive data — never persist raw session tokens
      partialize: (state) => ({
        selectedRole: state.selectedRole,
        user: state.user
          ? { id: state.user.id, email: state.user.email, fullName: state.user.fullName }
          : null,
        backendUser: state.backendUser,
      }),
    },
  ),
);
