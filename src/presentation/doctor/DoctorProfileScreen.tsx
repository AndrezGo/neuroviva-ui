'use client';

import { cn } from '@/shared/lib/cn';
import { DoctorTabBar } from './DoctorTabBar';

interface DoctorProfileScreenProps {
  firstName: string;
  email: string;
  specialty?: string | null;
  medicalLicense?: string | null;
  onSignOut: () => void;
  isSigningOut?: boolean;
  isScientificCommittee?: boolean;
}

/**
 * Stub profile screen for the Doctor panel.
 * Displays basic identity info and a sign-out action.
 * Purely presentational — no hooks, no API calls.
 */
export function DoctorProfileScreen({
  firstName,
  email,
  specialty,
  medicalLicense,
  onSignOut,
  isSigningOut = false,
  isScientificCommittee = false,
}: DoctorProfileScreenProps) {
  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-brand-dark">Perfil</h1>
      </div>

      {/* ── Profile card ─────────────────────────────────────── */}
      <div className="px-5">
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow">
          {/* Avatar */}
          <div className="mb-4 flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xl font-bold text-white"
              aria-hidden="true"
            >
              {firstName ? firstName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-brand-dark">{firstName || 'Médico'}</p>
              <p className="truncate text-sm text-gray-text">{email}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px bg-gray-100" aria-hidden="true" />

          {/* Details */}
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Especialidad
              </dt>
              <dd className="mt-0.5 text-sm text-brand-dark">
                {specialty ?? 'No especificada'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Registro médico
              </dt>
              <dd className="mt-0.5 text-sm text-brand-dark">
                {medicalLicense ?? 'No especificado'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="mt-6 px-5">
        <button
          type="button"
          onClick={onSignOut}
          disabled={isSigningOut}
          className={cn(
            'w-full rounded-2xl border border-gray-200 bg-white px-5 py-3.5',
            'text-sm font-semibold text-gray-text',
            'transition-colors hover:bg-gray-50 hover:text-brand-dark',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>

      {/* ── Mobile tab bar ────────────────────────────────────── */}
      <DoctorTabBar activeTab="profile" isScientificCommittee={isScientificCommittee} />
    </div>
  );
}
