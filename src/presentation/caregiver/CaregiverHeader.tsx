'use client';

import { Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { CaregiverPatient } from '@/domain/caregiver/caregiver.types';

interface CaregiverHeaderProps {
  greeting: string;
  firstName: string;
  patient: CaregiverPatient | null;
  patientMissing: boolean;
  onBellClick?: () => void;
  onPatientClick?: () => void;
  unreadCount?: number;
}

/**
 * Top header block for the Caregiver Inicio screen.
 * Contains the greeting h1, notification bell, and patient card.
 */
export function CaregiverHeader({
  greeting,
  firstName,
  patient,
  patientMissing,
  onBellClick,
  onPatientClick,
  unreadCount = 0,
}: CaregiverHeaderProps) {
  const patientInitial = patient?.name ? patient.name.charAt(0).toUpperCase() : '?';

  return (
    <header className="rounded-b-3xl bg-brand-surface px-5 pt-10 pb-6 lg:hidden">
      {/* Top row: greeting + bell */}
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
            {greeting}
          </span>
          <h1 className="text-2xl font-bold text-white break-words">
            {firstName ? (
              <>
                Hola, {firstName}{' '}
                <span role="img" aria-label="saludo">
                  👋
                </span>
              </>
            ) : (
              <>
                Hola{' '}
                <span role="img" aria-label="saludo">
                  👋
                </span>
              </>
            )}
          </h1>
        </div>

        <button
          type="button"
          onClick={onBellClick}
          aria-label="Notificaciones"
          className={cn(
            'relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10',
            'text-white transition-colors hover:bg-white/20',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface',
          )}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {/* Notification indicator dot */}
          {unreadCount > 0 && (
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Patient card */}
      <div className="mt-5">
        {patient ? (
          <button
            type="button"
            onClick={onPatientClick}
            aria-label={`Ver perfil de ${patient.name}`}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl bg-white/10 p-4',
              'text-left transition-colors hover:bg-white/15',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface',
            )}
          >
            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-role-patient-light">
              <span className="text-base font-bold text-role-patient">{patientInitial}</span>
            </div>

            {/* Info */}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-white">{patient.name}</p>
              <p className="truncate text-xs text-gray-300">
                {[
                  patient.age > 0 ? `${patient.age} años` : null,
                  patient.condition
                    ? `${patient.condition}${patient.conditionStage ? ` ${patient.conditionStage}` : ''}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          </button>
        ) : patientMissing ? (
          /* Soft onboarding prompt when no patient linked */
          <button
            type="button"
            onClick={onPatientClick}
            aria-label="Completar perfil del paciente"
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl bg-white/10 p-4',
              'text-left transition-colors hover:bg-white/15',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface',
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
              <span className="text-lg text-gray-300" aria-hidden="true">+</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Completa el perfil de tu paciente</p>
              <p className="text-xs text-gray-300">Toca para comenzar</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          </button>
        ) : (
          /* Loading skeleton while patient data is in flight */
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4" aria-busy="true" aria-label="Cargando perfil del paciente">
            <div className="h-11 w-11 animate-pulse rounded-full bg-white/20" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded-full bg-white/20" />
              <div className="h-3 w-48 animate-pulse rounded-full bg-white/20" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
