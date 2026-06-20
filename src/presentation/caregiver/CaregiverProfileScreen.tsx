'use client';

import { CaregiverTabBar } from './CaregiverTabBar';
import { Button } from '@/presentation/ui/Button';

interface CaregiverProfileScreenProps {
  name: string;
  email: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

/**
 * Composition root for the Caregiver Perfil screen.
 * Receives all data via props from the page; renders no hooks or side effects.
 */
export function CaregiverProfileScreen({
  name,
  email,
  onSignOut,
  isSigningOut = false,
}: CaregiverProfileScreenProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <>
      <main className="flex flex-1 flex-col items-center px-5 lg:px-10 pt-10 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-4xl lg:mx-auto lg:w-full">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary text-3xl font-bold text-white"
          aria-hidden="true"
        >
          {initial}
        </div>

        <h1 className="mt-4 text-xl font-black tracking-tight text-brand-dark">{name}</h1>
        <p className="mt-1 text-sm text-gray-text">{email}</p>

        <div className="mt-10 w-full max-w-xs">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            disabled={isSigningOut}
            onClick={onSignOut}
          >
            {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Button>
        </div>
      </main>

      <CaregiverTabBar activeTab="profile" />
    </>
  );
}
