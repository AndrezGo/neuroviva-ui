'use client';

import { Bell } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { CaregiverAccountMenu } from './CaregiverAccountMenu';

interface CaregiverDesktopHeaderProps {
  firstName: string;
  email: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
  onBellClick?: () => void;
  unreadCount: number;
}

/**
 * Fixed top header for the Caregiver desktop layout.
 * Sits to the right of the 240px sidebar (ml-60).
 * Purely presentational — no hooks, no API calls.
 */
export function CaregiverDesktopHeader({
  firstName,
  email,
  onSignOut,
  isSigningOut,
  onBellClick,
  unreadCount,
}: CaregiverDesktopHeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 hidden h-16 items-center justify-end border-b border-gray-200 bg-white px-6 shadow-sm lg:flex',
        'left-60',
      )}
    >
      {/* ── Right slot: bell + account menu ──────────────────── */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          type="button"
          onClick={onBellClick}
          aria-label="Notificaciones"
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-full',
            'text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
          )}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {/* Notification indicator dot */}
          {unreadCount > 0 && (
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warning"
              aria-hidden="true"
            />
          )}
        </button>

        {/* Account dropdown */}
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
