'use client';

import { Pill } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { TodayMedication, MedicationStatus } from '@/domain/caregiver/caregiver.types';

/**
 * Maps a 24h "HH:mm" string to a 12h "H:MM AM/PM" display string.
 * `scheduledTime` is backed by the medication's free-text frequency field
 * (e.g. "cada 8 horas"), not a guaranteed clock time — anything that isn't
 * a valid "HH:mm" is returned unchanged instead of producing "NaN:00 PM".
 */
function formatTime12h(time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return time;

  const hour = parseInt(match[1], 10);
  const minute = match[2];
  if (hour < 0 || hour > 23) return time;

  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
}

const statusLabels: Record<MedicationStatus, string> = {
  pending: 'pendiente',
  taken: 'tomado',
  skipped: 'omitido',
};

interface TodayMedicationItemProps {
  medication: TodayMedication;
}

/**
 * Single row displaying a scheduled medication for today.
 * Shows an "Ahora" badge in amber when the medication is due right now.
 */
export function TodayMedicationItem({ medication }: TodayMedicationItemProps) {
  const { name, dose, scheduledTime, status, isNow } = medication;

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary"
        aria-hidden="true"
      >
        <Pill className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-semibold text-brand-dark">{name}</p>
        <p className="truncate text-xs text-gray-text">
          {dose} · {formatTime12h(scheduledTime)} · {statusLabels[status]}
        </p>
      </div>

      {/* "Ahora" badge */}
      {isNow && (
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            'bg-warning-light text-warning',
          )}
        >
          Ahora
        </span>
      )}
    </div>
  );
}
