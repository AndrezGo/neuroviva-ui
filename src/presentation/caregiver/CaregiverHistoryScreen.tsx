'use client';

import { Activity, Calendar, ClipboardList, FileText, Paperclip, Pill } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';
import { CaregiverTabBar } from './CaregiverTabBar';
import { AddHistoryNoteSheet } from './AddHistoryNoteSheet';
import { cn } from '@/shared/lib/cn';
import type { HistoryEvent } from '@/domain/caregiver/caregiver.types';

// ── Module-scope helpers ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  symptom: 'Síntoma',
  consultation: 'Consulta',
  exam: 'Examen',
  procedure: 'Procedimiento',
  teleconsultation: 'Teleconsulta',
  medication: 'Medicamento',
  note: 'Nota',
  other: 'Otro',
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
    status === 'completed' ? 'Completada' :
    status === 'cancelled' ? 'Cancelada' :
    status === 'confirmed' ? 'Confirmada' :
    'Programada';

  const className =
    status === 'completed' ? 'bg-success-light text-success' :
    status === 'cancelled' ? 'bg-error-light text-error' :
    status === 'confirmed' ? 'bg-brand-primary-light text-brand-primary' :
    'bg-warning-light text-warning';

  return { label, className };
}

function formatHistoryDateTime(iso: string): string {
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

// ── Props ─────────────────────────────────────────────────────────────────────

interface CaregiverHistoryScreenProps {
  events: HistoryEvent[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  onAddNote: () => void;
  addNoteSheetOpen: boolean;
  onCloseAddNote: () => void;
  onSaveNote: (input: { eventType: string; description: string; eventDate?: string | null; attachment?: File | null }) => void;
  isSaving: boolean;
  saveError: string | null;
  onClearSaveError: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Pure UI screen for the Caregiver Historia tab.
 * All data and handlers come from props; this component holds no API hooks.
 */
export function CaregiverHistoryScreen({
  events,
  isLoading,
  isError,
  error,
  onReload,
  onAddNote,
  addNoteSheetOpen,
  onCloseAddNote,
  onSaveNote,
  isSaving,
  saveError,
  onClearSaveError,
}: CaregiverHistoryScreenProps) {
  const isEmpty = !isLoading && !isError && events.length === 0;

  return (
    <>
      <main className="flex flex-1 flex-col px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-dark mb-6">
          Historia
        </h1>

        {/* Error panel */}
        {isError && (
          <div
            role="alert"
            className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-4"
          >
            <p className="mb-3 text-sm font-medium text-error">
              {error ?? 'Ocurrió un error al cargar la historia clínica.'}
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
            aria-label="Cargando historia clínica"
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
            <p className="text-base font-semibold text-brand-dark">
              Sin registros en la historia
            </p>
            <p className="max-w-xs text-sm text-gray-text">
              Aquí verás los síntomas, citas, dosis y notas clínicas del paciente. Agrega la primera nota para empezar.
            </p>
            <Button variant="primary" size="md" onClick={onAddNote} className="mt-2">
              Agregar nota
            </Button>
          </div>
        )}

        {/* Populated list */}
        {!isLoading && !isEmpty && (
          <ul
            aria-label="Historia clínica"
            className="mb-4 rounded-2xl border border-gray-200 shadow-sm px-4"
          >
            {events.map((event) => {
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
                    <p className="truncate text-sm font-semibold text-brand-dark">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-text">
                      {formatHistoryDateTime(event.eventDate)}
                    </p>
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

        {/* Bottom CTA — only visible when list is populated */}
        {!isLoading && !isEmpty && !isError && (
          <div className="mt-4">
            <Button variant="primary" size="md" fullWidth onClick={onAddNote}>
              Agregar nota
            </Button>
          </div>
        )}
      </main>

      <CaregiverTabBar activeTab="history" />

      <AddHistoryNoteSheet
        open={addNoteSheetOpen}
        isSaving={isSaving}
        error={saveError}
        onClose={onCloseAddNote}
        onSave={onSaveNote}
        onClearError={onClearSaveError}
      />
    </>
  );
}
