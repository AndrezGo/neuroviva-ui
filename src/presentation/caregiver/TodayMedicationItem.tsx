'use client';

import { Pill } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { TodayMedication, MedicationStatus } from '@/domain/caregiver/caregiver.types';

/** Maps a 24h "HH:mm" string to a 12h "H:MM AM/PM" display string. */
function formatTime12h(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr ?? '0', 10);
  const minute = minuteStr ?? '00';
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
