'use client';

import { useEffect, useState } from 'react';
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

/**
 * Formats the time remaining until `nextDoseAt` as "Próxima toma en X".
 * Returns null when there's nothing meaningful to show (no next-dose data,
 * or it's already due/overdue — the "Ahora" badge covers that case instead).
 */
function formatNextDoseCountdown(nextDoseAt: string, now: number): string | null {
  const target = new Date(nextDoseAt).getTime();
  if (Number.isNaN(target)) return null;

  const diffMs = target - now;
  if (diffMs <= 0) return null;

  const totalMinutes = Math.round(diffMs / 60_000);
  if (totalMinutes < 1) return 'Próxima toma en menos de 1 min';
  if (totalMinutes < 60) return `Próxima toma en ${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `Próxima toma en ${hours} h ${minutes} min` : `Próxima toma en ${hours} h`;
}

interface TodayMedicationItemProps {
  medication: TodayMedication;
}

/**
 * Single row displaying a scheduled medication for today.
 * Shows an "Ahora" badge in amber when the medication is due right now,
 * and a live-updating "próxima toma en X" countdown when nextDoseAt is set.
 */
export function TodayMedicationItem({ medication }: TodayMedicationItemProps) {
  const { name, dose, scheduledTime, status, isNow, nextDoseAt } = medication;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!nextDoseAt) return;
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [nextDoseAt]);

  const countdown = nextDoseAt ? formatNextDoseCountdown(nextDoseAt, now) : null;

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
        {countdown && (
          <p className="truncate text-xs font-medium text-brand-primary">{countdown}</p>
        )}
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
