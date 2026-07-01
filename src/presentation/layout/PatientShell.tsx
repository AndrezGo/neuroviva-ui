'use client';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { useSignOut } from '@/application/auth/useSignOut';
import { getFirstName, getGreeting } from '@/shared/lib/greeting';

interface PatientShellProps {
  children: React.ReactNode;
}

/**
 * Minimal shell for the Patient section.
 * Mobile-first: centered max-w-md column on a light background.
 * Includes a greeting header and a sign-out button.
 */
export function PatientShell({ children }: PatientShellProps) {
  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const firstName = getFirstName(backendUser?.name ?? user?.fullName);
  const greeting = getGreeting();

  const { signOut, isLoading: isSigningOut } = useSignOut();

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-slate-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white md:shadow-[0_0_48px_0_rgb(0_0_0_/_0.12)]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-text">{greeting}</p>
            <p className="text-base font-bold text-brand-dark leading-tight">
              {firstName ? firstName : 'Mi espacio'}
            </p>
          </div>
          <button
            onClick={signOut}
            disabled={isSigningOut}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-text transition-colors hover:border-brand-primary/50 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar sesión"
          >
            {isSigningOut ? 'Saliendo…' : 'Salir'}
          </button>
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
