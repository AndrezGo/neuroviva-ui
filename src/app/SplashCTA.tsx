'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/presentation/ui/Button';
import { routes } from '@/core/routing/routes';

/**
 * Small client island for the Splash screen CTA button.
 * Keeps the parent page server-renderable.
 */
export function SplashCTA() {
  const router = useRouter();

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      onClick={() => router.push(routes.login())}
    >
      Comenzar
    </Button>
  );
}
