'use client';

import { Loader2 } from 'lucide-react';
import type { AppointmentOutcome } from '@/domain/caregiver/caregiver.types';

interface AppointmentOutcomeSelectorProps {
  appointmentId: string;
  onSelect: (outcome: AppointmentOutcome) => Promise<boolean>;
  isSubmitting: boolean;
  pendingOutcome: AppointmentOutcome | null;
}

const OUTCOMES: {
  value: AppointmentOutcome;
  label: string;
  emoji: string;
  classes: string;
}[] = [
  {
    value: 'attended',
    label: 'Asistió',
    emoji: '✅',
    classes:
      'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  },
  {
    value: 'cancelled',
    label: 'Se canceló',
    emoji: '❌',
    classes: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  },
  {
    value: 'missed',
    label: 'Se le olvidó',
    emoji: '😔',
    classes:
      'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
];

export function AppointmentOutcomeSelector({
  appointmentId: _appointmentId,
  onSelect,
  isSubmitting,
  pendingOutcome,
}: AppointmentOutcomeSelectorProps) {
  return (
    <div className="mt-3" role="group" aria-label="Registrar resultado de la cita">
      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 mb-2">
        <span aria-hidden="true">🟡</span>
        ¿Qué pasó con esta cita?
      </span>
      {/* Outcome buttons */}
      <div className="flex flex-wrap gap-2">
        {OUTCOMES.map(({ value, label, emoji, classes }) => {
          const isPending = isSubmitting && pendingOutcome === value;
          return (
            <button
              key={value}
              type="button"
              disabled={isSubmitting}
              aria-label={`Marcar como: ${label}`}
              aria-busy={isPending}
              onClick={() => onSelect(value)}
              className={[
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-60',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                classes,
              ].join(' ')}
            >
              {isPending ? (
                <Loader2 size={12} className="animate-spin" aria-hidden />
              ) : (
                <span aria-hidden="true">{emoji}</span>
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
