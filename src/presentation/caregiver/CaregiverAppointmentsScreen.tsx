'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';
import { CaregiverTabBar } from './CaregiverTabBar';
import { AppointmentOutcomeSelector } from './AppointmentOutcomeSelector';
import { isAwaitingOutcome } from '@/domain/caregiver/appointmentHelpers';
import { cn } from '@/shared/lib/cn';
import type { Appointment, AppointmentOutcome } from '@/domain/caregiver/caregiver.types';

// ── Module-scope helpers ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  consultation: 'Consulta',
  exam: 'Examen',
  procedure: 'Procedimiento',
  teleconsultation: 'Teleconsulta',
};

function formatAppointmentDateTime(iso: string): string {
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('es-CO', { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(date);
  const time = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('.', '');
  return `${cap(weekday)} ${day} ${cap(month)} · ${time}`;
}

// ── AppointmentListItem ───────────────────────────────────────────────────────

interface AppointmentListItemProps {
  appointment: Appointment;
  cancellingId: string | null;
  onCancelStart: (id: string) => void;
  onCancelConfirm: (id: string) => void;
  onCancelAbort: () => void;
  onRecordOutcome: (id: string, outcome: AppointmentOutcome) => Promise<boolean>;
  isSubmittingOutcome: boolean;
  pendingOutcomeId: string | null;
  pendingOutcome: AppointmentOutcome | null;
}

function AppointmentListItem({
  appointment,
  cancellingId,
  onCancelStart,
  onCancelConfirm,
  onCancelAbort,
  onRecordOutcome,
  isSubmittingOutcome,
  pendingOutcomeId,
  pendingOutcome,
}: AppointmentListItemProps) {
  const { id, title, type, scheduledAt, status } = appointment;
  const canCancel = status === 'scheduled' || status === 'confirmed';
  const isConfirming = cancellingId === id;

  const statusLabel =
    status === 'completed' ? 'Completada' :
    status === 'attended' ? 'Asistió' :
    status === 'missed' ? 'Se le olvidó' :
    status === 'cancelled' ? 'Cancelada' :
    status === 'confirmed' ? 'Confirmada' :
    'Programada';

  const statusClass =
    status === 'completed' ? 'bg-success-light text-success' :
    status === 'attended' ? 'bg-success-light text-success' :
    status === 'missed' ? 'bg-warning-light text-warning' :
    status === 'cancelled' ? 'bg-error-light text-error' :
    status === 'confirmed' ? 'bg-brand-primary-light text-brand-primary' :
    'bg-warning-light text-warning';

  return (
    <li className="flex flex-col py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-role-professional-light text-role-professional"
          aria-hidden="true"
        >
          <Calendar className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-brand-dark">{title}</p>
            {canCancel && !isConfirming && (
              <button
                type="button"
                onClick={() => onCancelStart(id)}
                className="shrink-0 text-xs font-medium text-gray-text underline-offset-2 hover:text-error hover:underline transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
          <p className="truncate text-xs text-gray-text mt-0.5">
            {formatAppointmentDateTime(scheduledAt)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-text">
              {TYPE_LABELS[type] ?? type}
            </span>
            <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', statusClass)}>
              {statusLabel}
            </span>
          </div>

          {/* Outcome selector — shown only for past appointments awaiting a result */}
          {isAwaitingOutcome(appointment) && (
            <AppointmentOutcomeSelector
              appointmentId={id}
              onSelect={(outcome) => onRecordOutcome(id, outcome)}
              isSubmitting={isSubmittingOutcome && pendingOutcomeId === id}
              pendingOutcome={pendingOutcomeId === id ? pendingOutcome : null}
            />
          )}
        </div>
      </div>

      {/* Inline cancel confirmation */}
      {isConfirming && (
        <div className="mt-3 flex items-center gap-2 pl-[52px]">
          <p className="flex-1 text-xs text-gray-text">¿Cancelar esta cita?</p>
          <button
            type="button"
            onClick={() => onCancelConfirm(id)}
            className="rounded-xl bg-error px-3 py-1.5 text-xs font-semibold text-white active:opacity-80"
          >
            Sí, cancelar
          </button>
          <button
            type="button"
            onClick={onCancelAbort}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark active:bg-gray-50"
          >
            No
          </button>
        </div>
      )}
    </li>
  );
}

// ── CaregiverAppointmentsScreen ───────────────────────────────────────────────

interface CaregiverAppointmentsScreenProps {
  appointments: Appointment[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  onAdd: () => void;
  onCancel: (id: string) => Promise<boolean>;
  onRecordOutcome: (id: string, outcome: AppointmentOutcome) => Promise<boolean>;
  isSubmittingOutcome: boolean;
  pendingOutcomeId: string | null;
  pendingOutcome: AppointmentOutcome | null;
}

/**
 * Pure UI screen for the Caregiver Agenda tab.
 * All data and handlers come from props; this component holds no API hooks.
 */
export function CaregiverAppointmentsScreen({
  appointments,
  isLoading,
  isError,
  error,
  onReload,
  onAdd,
  onCancel,
  onRecordOutcome,
  isSubmittingOutcome,
  pendingOutcomeId,
  pendingOutcome,
}: CaregiverAppointmentsScreenProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const isEmpty = !isLoading && !isError && appointments.length === 0;

  const handleCancelStart = (id: string) => setCancellingId(id);
  const handleCancelAbort = () => setCancellingId(null);
  const handleCancelConfirm = async (id: string) => {
    const ok = await onCancel(id);
    if (ok) setCancellingId(null);
  };

  return (
    <>
      <main className="flex flex-1 flex-col px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-dark mb-6">
          Agenda
        </h1>

        {/* Error panel */}
        {isError && (
          <div
            role="alert"
            className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-4"
          >
            <p className="mb-3 text-sm font-medium text-error">
              {error ?? 'Ocurrió un error al cargar las citas.'}
            </p>
            <Button variant="primary" size="sm" onClick={onReload}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div
            className="space-y-0 divide-y divide-gray-100"
            aria-busy="true"
            aria-label="Cargando citas"
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-4">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-3 w-56 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-role-professional-light text-role-professional">
              <Calendar className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-brand-dark">
              Sin citas registradas
            </p>
            <p className="max-w-xs text-sm text-gray-text">
              Agrega la primera cita médica para hacer seguimiento a los controles.
            </p>
            <Button variant="primary" size="md" onClick={onAdd} className="mt-2">
              Agregar cita
            </Button>
          </div>
        )}

        {/* Populated list */}
        {!isLoading && !isEmpty && (
          <ul aria-label="Lista de citas" className="mb-4 rounded-2xl border border-gray-200 shadow-sm px-4">
            {appointments.map((appt) => (
              <AppointmentListItem
                key={appt.id}
                appointment={appt}
                cancellingId={cancellingId}
                onCancelStart={handleCancelStart}
                onCancelConfirm={handleCancelConfirm}
                onCancelAbort={handleCancelAbort}
                onRecordOutcome={onRecordOutcome}
                isSubmittingOutcome={isSubmittingOutcome}
                pendingOutcomeId={pendingOutcomeId}
                pendingOutcome={pendingOutcome}
              />
            ))}
          </ul>
        )}

        {/* Primary CTA — only visible when list is populated */}
        {!isLoading && !isEmpty && (
          <div className="mt-4">
            <Button variant="primary" size="md" fullWidth onClick={onAdd}>
              Agregar cita
            </Button>
          </div>
        )}
      </main>

      <CaregiverTabBar activeTab="agenda" />
    </>
  );
}
