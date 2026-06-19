'use client';

import { useEffect } from 'react';
import { Button } from '@/presentation/ui/Button';
import { BrandMark } from '@/presentation/ui/BrandMark';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service when available
    console.error('[NeuroViva Error]', error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--color-splash-bg)' }}
    >
      <BrandMark size="md" className="mb-6 opacity-80" />
      <h1 className="text-2xl font-black text-white mb-2">Algo salió mal</h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Ocurrió un error inesperado. Por favor intenta de nuevo.
      </p>
      <Button variant="primary" onClick={reset}>
        Intentar de nuevo
      </Button>
    </main>
  );
}
