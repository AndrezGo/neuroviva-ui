'use client';

import { cn } from '@/shared/lib/cn';
import { CaregiverAccountMenu } from './CaregiverAccountMenu';

interface DoctorDesktopHeaderProps {
  firstName: string;
  email: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

/**
 * Fixed top header for the Doctor desktop layout.
 * Sits to the right of the 240px sidebar (ml-60).
 * No notification bell — doctors use the Alertas tab instead.
 * Purely presentational — no hooks, no API calls.
 */
export function DoctorDesktopHeader({
  firstName,
  email,
  onSignOut,
  isSigningOut,
}: DoctorDesktopHeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 hidden h-16 items-center justify-end border-b border-gray-200 bg-white px-6 shadow-sm lg:flex',
        'left-60',
      )}
    >
      {/* ── Right slot: account menu only (no bell for doctors) ── */}
      <div className="flex items-center gap-4">
        <CaregiverAccountMenu
          firstName={firstName}
          email={email}
          onSignOut={onSignOut}
          isSigningOut={isSigningOut}
        />
      </div>
    </header>
  );
}
