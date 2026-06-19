'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
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
          className="text-base font-bold text-brand-dark"
        >
          Pendiente de hoy
        </h2>
        <Link
          href={routes.caregiverAgenda()}
          className="text-sm font-medium text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 rounded"
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
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
            <ClipboardList className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-gray-text">Nada pendiente por ahora</p>
          <p className="text-xs text-gray-400">Disfruta el día tranquilo</p>
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
