'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { TodayMedicationItem } from './TodayMedicationItem';
import { TodayAppointmentItem } from './TodayAppointmentItem';
import { routes } from '@/core/routing/routes';
import type { CaregiverToday } from '@/domain/caregiver/caregiver.types';

interface TodaySectionProps {
  today: CaregiverToday | null;
  isLoading: boolean;
}

/**
 * Section showing today's pending medications and appointments.
 * Handles loading skeletons, empty state, and populated lists.
 */
export function TodaySection({ today, isLoading }: TodaySectionProps) {
  const isEmpty =
    !isLoading &&
    today !== null &&
    today.medications.length === 0 &&
    today.appointments.length === 0;

  return (
    <section aria-labelledby="today-heading">
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <h2
          id="today-heading"
          className="text-xs font-semibold uppercase tracking-wider text-gray-400"
        >
          Pendiente de hoy
        </h2>
        <Link
          href={routes.caregiverAgenda()}
          className="text-xs font-semibold uppercase tracking-wider text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 rounded"
        >
          Ver todo
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-1" aria-busy="true" aria-label="Cargando tareas de hoy">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-36 animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-52 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 py-8 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary-light text-brand-primary">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-dark">Todo al día</p>
            <p className="mt-1 text-xs text-gray-text">No tienes tareas pendientes para hoy</p>
          </div>
          <Link
            href={routes.caregiverAgenda()}
            className="mt-1 text-xs font-medium text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 rounded"
          >
            Agregar recordatorio en la agenda →
          </Link>
        </div>
      )}

      {/* Populated list */}
      {!isLoading && today && !isEmpty && (
        <div className="divide-y divide-gray-100">
          {today.medications.map((med) => (
            <TodayMedicationItem key={med.id} medication={med} />
          ))}
          {today.appointments.map((appt) => (
            <TodayAppointmentItem key={appt.id} appointment={appt} />
          ))}
        </div>
      )}
    </section>
  );
}
