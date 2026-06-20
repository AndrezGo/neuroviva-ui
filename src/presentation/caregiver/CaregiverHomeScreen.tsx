'use client';

import { CaregiverHeader } from './CaregiverHeader';
import { ActionGrid } from './ActionGrid';
import { TodaySection } from './TodaySection';
import { CaregiverTabBar } from './CaregiverTabBar';
import { Button } from '@/presentation/ui/Button';
import type { CaregiverPatient, CaregiverToday } from '@/domain/caregiver/caregiver.types';

interface CaregiverHomeScreenProps {
  greeting: string;
  firstName: string;
  patient: CaregiverPatient | null;
  patientMissing: boolean;
  today: CaregiverToday | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  onSignOut?: () => void;
  onBellClick?: () => void;
  onPatientClick?: () => void;
}

/**
 * Composition root for the Caregiver Inicio screen.
 * Receives all data via props from the page; renders no hooks or side effects.
 */
export function CaregiverHomeScreen({
  greeting,
  firstName,
  patient,
  patientMissing,
  today,
  isLoading,
  isError,
  error,
  onReload,
  onSignOut,
  onBellClick,
  onPatientClick,
}: CaregiverHomeScreenProps) {
  const isSessionError = error?.includes('cierra sesión') ?? false;
  return (
    <>
      {/* Navy header with greeting h1 and patient card */}
      <CaregiverHeader
        greeting={greeting}
        firstName={firstName}
        patient={patient}
        patientMissing={patientMissing}
        onBellClick={onBellClick}
        onPatientClick={onPatientClick}
      />

      {/* Main white body */}
      <main className="flex flex-1 flex-col gap-6 px-5 lg:px-10 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-4xl lg:mx-auto lg:w-full">
        {/* Desktop-only page header — greeting + name */}
        <header className="hidden lg:block">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
            {greeting}
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-dark">
            {firstName ? `Hola, ${firstName}` : 'Hola'}
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Este es el resumen de hoy para tu paciente.
          </p>
        </header>

        {/* Error panel — shown when API fetch fails */}
        {isError && (
          <div
            role="alert"
            className="animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-4"
          >
            <p className="mb-3 text-sm font-medium text-error">
              {error ?? 'Ocurrió un error al cargar la información.'}
            </p>
            <div className="flex gap-2">
              {isSessionError && onSignOut ? (
                <Button variant="primary" size="sm" onClick={onSignOut}>
                  Cerrar sesión
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={onReload}>
                  Reintentar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Quick actions grid */}
        <section aria-labelledby="actions-heading" className="animate-fade-up">
          <h2
            id="actions-heading"
            className="mb-3 text-base font-bold text-brand-dark"
          >
            ¿Qué necesitas hoy?
          </h2>
          <ActionGrid />
        </section>

        {/* Today's tasks */}
        <div className="animate-fade-up delay-200">
          <TodaySection today={today} isLoading={isLoading} />
        </div>
      </main>

      {/* Fixed bottom tab bar */}
      <CaregiverTabBar activeTab="home" />
    </>
  );
}
