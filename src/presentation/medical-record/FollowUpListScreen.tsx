'use client';

import { Activity, Calendar, ClipboardList, FileText, Paperclip, Pill } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';
import { cn } from '@/shared/lib/cn';
import { formatEventDate } from '@/shared/lib/formatEventDate';
import { useFollowUp } from '@/application/medical-record/useFollowUp';
import type { FollowUpEvent } from '@/domain/medical-record/medicalRecord.types';

// ── Module-scope helpers ──────────────────────────────────────────────────────

// note and other are excluded — those belong to Notas Clínicas
const TYPE_LABELS: Record<string, string> = {
  symptom: 'Síntoma',
  consultation: 'Consulta',
  exam: 'Examen',
  procedure: 'Procedimiento',
  teleconsultation: 'Teleconsulta',
  medication: 'Medicamento',
};

function getTypeIcon(type: string) {
  if (type === 'symptom') return Activity;
  if (
    type === 'consultation' ||
    type === 'exam' ||
    type === 'procedure' ||
    type === 'teleconsultation'
  ) {
    return Calendar;
  }
  if (type === 'medication') return Pill;
  return FileText;
}

function typeBadgeClasses(type: string): string {
  if (type === 'symptom') return 'bg-brand-primary-light text-brand-primary';
  if (
    type === 'consultation' ||
    type === 'exam' ||
    type === 'procedure' ||
    type === 'teleconsultation'
  ) {
    return 'bg-role-professional-light text-role-professional';
  }
  if (type === 'medication') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-text';
}

function getStatusBadge(status: string): { label: string; className: string } {
  const label =
    status === 'completed'
      ? 'Completada'
      : status === 'cancelled'
        ? 'Cancelada'
        : status === 'confirmed'
          ? 'Confirmada'
          : 'Programada';

  const className =
    status === 'completed'
      ? 'bg-success-light text-success'
      : status === 'cancelled'
        ? 'bg-error-light text-error'
        : status === 'confirmed'
          ? 'bg-brand-primary-light text-brand-primary'
          : 'bg-warning-light text-warning';

  return { label, className };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface FollowUpListScreenProps {
  patientId: string;
  mode: 'caregiver' | 'doctor';
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Read-only follow-up timeline screen.
 * Rendered inside MedicalRecordScreen's <main> — no <main> wrapper here.
 */
export function FollowUpListScreen({ patientId, mode: _mode }: FollowUpListScreenProps) {
  const { events, isLoading, isError, error, reload } = useFollowUp(patientId);

  const isEmpty = !isLoading && !isError && events.length === 0;

  return (
    <div>
      {/* Error panel */}
      {isError && (
        <div
          role="alert"
          className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-4"
        >
          <p className="mb-3 text-sm font-medium text-error">
            {error ?? 'Ocurrió un error al cargar el seguimiento.'}
          </p>
          <Button variant="primary" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div
          className="space-y-0 divide-y divide-gray-100"
          aria-busy="true"
          aria-label="Cargando seguimiento"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-4">
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
        <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary">
            <ClipboardList className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="text-base font-semibold text-brand-dark">Sin registros de seguimiento</p>
          <p className="max-w-xs text-sm text-gray-text">
            Aquí verás los síntomas, citas y dosis del paciente.
          </p>
        </div>
      )}

      {/* Populated list */}
      {!isLoading && !isError && !isEmpty && (
        <ul
          aria-label="Seguimiento"
          className="mb-4 rounded-2xl border border-gray-200 shadow-sm px-4"
        >
          {events.map((event: FollowUpEvent) => {
            const Icon = getTypeIcon(event.type);
            const statusBadge = event.status ? getStatusBadge(event.status) : null;

            return (
              <li
                key={event.id}
                className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-b-0"
              >
                {/* Icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-text"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-dark">{event.title}</p>
                  <p className="text-xs text-gray-text">{formatEventDate(event.eventDate)}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        typeBadgeClasses(event.type),
                      )}
                    >
                      {TYPE_LABELS[event.type] ?? event.type}
                    </span>
                    {statusBadge && (
                      <span
                        className={cn(
                          'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                          statusBadge.className,
                        )}
                      >
                        {statusBadge.label}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="mt-1 text-xs text-gray-text line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  {event.attachmentUrl && (
                    <a
                      href={event.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-primary"
                    >
                      <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                      {event.attachmentFileName ?? 'Ver archivo adjunto'}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
