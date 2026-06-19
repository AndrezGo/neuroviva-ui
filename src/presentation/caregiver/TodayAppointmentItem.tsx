'use client';

import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { routes } from '@/core/routing/routes';
import type { TodayAppointment } from '@/domain/caregiver/caregiver.types';

/** Formats an ISO 8601 date string as "Vie 14 Jun · 10:30 AM" (es-CO locale). */
function formatAppointmentDate(iso: string): string {
  const date = new Date(iso);

  const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('es-CO', { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(date);
  const time = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  // Capitalize first letter of weekday and month abbreviations
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('.', '');

  return `${cap(weekday)} ${day} ${cap(month)} · ${time}`;
}

interface TodayAppointmentItemProps {
  appointment: TodayAppointment;
}

/**
 * Single row displaying a scheduled appointment for today.
 * Links to the agenda page.
 */
export function TodayAppointmentItem({ appointment }: TodayAppointmentItemProps) {
  const { title, scheduledAt } = appointment;

  return (
    <Link
      href={routes.caregiverAgenda()}
      className="flex items-center gap-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-lg"
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-role-professional-light text-role-professional"
        aria-hidden="true"
      >
        <Calendar className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-semibold text-brand-dark">{title}</p>
        <p className="truncate text-xs text-gray-text">{formatAppointmentDate(scheduledAt)}</p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
    </Link>
  );
}
