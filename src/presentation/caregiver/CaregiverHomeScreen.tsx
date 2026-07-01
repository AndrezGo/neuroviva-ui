'use client';

import { ChevronRight } from 'lucide-react';
import { CaregiverHeader } from './CaregiverHeader';
import { ActionGrid } from './ActionGrid';
import { TodaySection } from './TodaySection';
import { CaregiverTabBar } from './CaregiverTabBar';
import { Button } from '@/presentation/ui/Button';
import type { CaregiverPatient, CaregiverToday } from '@/domain/caregiver/caregiver.types';

function buildPatientInfo(patient: CaregiverPatient): string {
  return [
    patient.age > 0 ? `${patient.age} años` : null,
    patient.conditions.length > 0
      ? `${patient.conditions.join(', ')}${patient.conditionStage ? ` ${patient.conditionStage}` : ''}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function buildDynamicSubtitle(patient: CaregiverPatient | null, today: CaregiverToday | null): string {
  if (!patient) return 'Este es el resumen de hoy para tu paciente.';
  const pending =
    (today?.medications.filter((m) => m.status === 'pending').length ?? 0) +
    (today?.appointments.length ?? 0);
  if (pending > 0)
    return `${patient.name} tiene ${pending} tarea${pending > 1 ? 's' : ''} pendiente${pending > 1 ? 's' : ''} hoy.`;
  return `Todo al día con ${patient.name} hoy.`;
}

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
  unreadCount?: number;
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
  unreadCount = 0,
}: CaregiverHomeScreenProps) {
  const isSessionError = error?.includes('cierra sesión') ?? false;
  const patientInitial = patient?.name ? patient.name.charAt(0).toUpperCase() : '?';
  const patientInfo = patient ? buildPatientInfo(patient) : '';
  const dynamicSubtitle = buildDynamicSubtitle(patient, today);
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
        unreadCount={unreadCount}
      />

      {/* Main white body */}
      <main className="flex flex-1 flex-col gap-6 px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full lg:grid lg:grid-cols-[1.6fr_1fr] lg:gap-6 lg:items-start">

        {/* LEFT COLUMN (xl): desktop header + error panel + quick actions */}
        <div className="flex flex-col gap-6 lg:col-start-1">
          {/* Desktop-only page header — greeting + name + patient card */}
          <header className="hidden lg:block">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
              {greeting}
            </span>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-dark">
              {firstName ? `Hola, ${firstName}` : 'Hola'}
            </h1>
            <p className="mt-1 text-sm text-gray-text">
              {dynamicSubtitle}
            </p>

            {/* Patient card — desktop only, full-width in left column */}
            {patient ? (
              <button
                type="button"
                onClick={onPatientClick}
                aria-label={`Ver perfil de ${patient.name}`}
                className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-role-patient-light">
                  <span className="text-xl font-bold text-role-patient">{patientInitial}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-brand-dark">{patient.name}</p>
                  {patientInfo && (
                    <p className="truncate text-sm text-gray-text mt-0.5">
                      {patientInfo}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              </button>
            ) : patientMissing ? (
              <button
                type="button"
                onClick={onPatientClick}
                aria-label="Completar perfil del paciente"
                className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-left transition-colors hover:border-brand-primary hover:bg-brand-primary-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <span className="text-xl text-gray-400" aria-hidden="true">+</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-brand-dark">Completa el perfil de tu paciente</p>
                  <p className="text-sm text-gray-text mt-0.5">Haz clic para comenzar</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              </button>
            ) : (
              <div
                className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5"
                aria-busy="true"
                aria-label="Cargando perfil del paciente"
              >
                <div className="h-14 w-14 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-3 w-52 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
            )}
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
          <section aria-labelledby="actions-heading" className="animate-fade-up mt-2">
            <h2
              id="actions-heading"
              className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
            >
              Acciones rápidas
            </h2>
            <ActionGrid />
          </section>
        </div>

        {/* RIGHT COLUMN (xl): today's tasks */}
        <div className="lg:col-start-2 animate-fade-up delay-200">
          <TodaySection today={today} isLoading={isLoading} />
        </div>
      </main>

      {/* Fixed bottom tab bar */}
      <CaregiverTabBar activeTab="home" />
    </>
  );
}
