'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { routes } from '@/core/routing/routes';

/**
 * Splash screen CTA. Self-contained premium button tuned for the dark
 * charcoal→teal splash background. Not the generic Button component.
 */
export function SplashCTA() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(routes.login())}
      className={cn(
        'group inline-flex h-14 w-full items-center justify-center gap-2',
        'rounded-2xl bg-gradient-to-r from-brand-primary to-brand-primary-dark',
        'text-lg font-semibold tracking-tight text-white',
        'shadow-lg shadow-brand-primary/20',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-primary/30',
        'active:scale-[0.98] active:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-splash-bg)]',
      )}
    >
      Comenzar
      <ArrowRight
        className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1"
        aria-hidden="true"
      />
    </button>
  );
}
