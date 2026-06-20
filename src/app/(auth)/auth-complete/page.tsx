'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePostAuthNavigation } from '@/application/auth/usePostAuthNavigation';
import { routes } from '@/core/routing/routes';

export default function AuthCompletePage() {
  const { run, error } = usePostAuthNavigation();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    run();
  }, [run]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-gray-text">{error}</p>
        <Link href={routes.login()} className="mt-4 text-sm font-semibold text-brand-primary underline">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <main
      className="flex flex-1 flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Completando inicio de sesión"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" aria-hidden="true" />
      <p className="mt-4 text-sm text-gray-text">Completando inicio de sesión…</p>
    </main>
  );
}
