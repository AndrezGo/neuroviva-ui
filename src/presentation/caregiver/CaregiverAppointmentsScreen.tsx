'use client';

import { Calendar } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';
import { CaregiverTabBar } from './CaregiverTabBar';
import { cn } from '@/shared/lib/cn';
import type { Appointment } from '@/domain/caregiver/caregiver.types';

/**
 * Formats an ISO 8601 date-time string as "Vie 14 Jun · 10:30 AM" (es-CO locale).
 * Local helper — intentionally not imported from TodayAppointmentItem.
 */
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
}

function AppointmentListItem({ appointment }: AppointmentListItemProps) {
  const { title, type, scheduledAt, status } = appointment;

  const statusLabel =
    status === 'completed'
      ? 'Completada'
      : status === 'cancelled'
        ? 'Cancelada'
        : 'Pendiente';

  const statusClass =
    status === 'completed'
      ? 'bg-success-light text-success'
      : status === 'cancelled'
        ? 'bg-error-light text-error'
        : 'bg-warning-light text-warning';

  return (
    <li className="flex items-start gap-3 py-4 border-b border-gray-100 last:border-b-0">
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-role-professional-light text-role-professional"
        aria-hidden="true"
      >
        <Calendar className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-brand-dark">{title}</p>
        <p className="truncate text-xs text-gray-text">{formatAppointmentDateTime(scheduledAt)}</p>

        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {/* Type chip */}
          <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-text">
            {type}
          </span>
          {/* Status badge */}
          <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', statusClass)}>
            {statusLabel}
          </span>
        </div>
      </div>
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
}

/**
 * Pure UI screen for the Caregiver Agenda tab.
 * All data and handlers come from props; this component holds no hooks.
 */
export function CaregiverAppointmentsScreen({
  appointments,
  isLoading,
  isError,
  error,
  onReload,
  onAdd,
}: CaregiverAppointmentsScreenProps) {
  const isEmpty = !isLoading && !isError && appointments.length === 0;

  return (
    <>
      <main className="flex flex-1 flex-col px-5 lg:px-10 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-4xl lg:mx-auto lg:w-full">
        <h1 className="text-2xl font-black tracking-tight text-brand-dark mb-6">
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
          <ul aria-label="Lista de citas" className="mb-4">
            {appointments.map((appt) => (
              <AppointmentListItem key={appt.id} appointment={appt} />
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
