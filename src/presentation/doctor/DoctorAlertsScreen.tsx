'use client';

import { cn } from '@/shared/lib/cn';
import { formatRelativeTime } from '@/shared/lib/relativeTime';
import { DoctorTabBar } from './DoctorTabBar';
import type { DoctorAlert, AlertPriority } from '@/domain/doctor/doctor.types';

interface DoctorAlertsScreenProps {
  alerts: DoctorAlert[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  onMarkSeen: (id: string) => void;
  onResolve: (id: string) => void;
  isScientificCommittee?: boolean;
}

/**
 * Returns badge classes and display label for an alert priority level.
 */
function getPriorityBadge(priority: AlertPriority): { classes: string; label: string } {
  switch (priority) {
    case 'critica':
      return { classes: 'bg-red-100 text-red-700', label: 'Crítica' };
    case 'alta':
      return { classes: 'bg-orange-100 text-orange-700', label: 'Alta' };
    case 'media':
      return { classes: 'bg-yellow-100 text-yellow-700', label: 'Media' };
    case 'info':
    default:
      return { classes: 'bg-blue-100 text-blue-700', label: 'Info' };
  }
}

/**
 * Purely presentational screen for the doctor's smart alerts.
 * Wires onMarkSeen and onResolve from the page (which delegates to useDoctorAlerts).
 */
export function DoctorAlertsScreen({
  alerts,
  isLoading,
  isError,
  error,
  onReload,
  onMarkSeen,
  onResolve,
  isScientificCommittee = false,
}: DoctorAlertsScreenProps) {
  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-brand-dark">Alertas Inteligentes</h1>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-5 gap-3">
        {/* Loading skeleton */}
        {isLoading && (
          <div aria-busy="true" aria-label="Cargando alertas">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="mb-3 h-32 w-full animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
          >
            <p className="text-sm font-medium text-red-700">{error ?? 'Error al cargar las alertas.'}</p>
            <button
              type="button"
              onClick={onReload}
              className={cn(
                'rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white',
                'transition-colors hover:opacity-90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
              )}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && alerts.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-gray-text">No hay alertas activas.</p>
          </div>
        )}

        {/* Alert cards */}
        {!isLoading &&
          !isError &&
          alerts.map((alert) => {
            const badge = getPriorityBadge(alert.priority);
            return (
              <article
                key={alert.id}
                className={cn(
                  'rounded-2xl border px-5 py-4 shadow',
                  alert.seen
                    ? 'border-gray-100 bg-white'
                    : 'border-brand-primary/20 bg-brand-primary/5',
                )}
                onClick={() => {
                  if (!alert.seen) onMarkSeen(alert.id);
                }}
                role={!alert.seen ? 'button' : undefined}
                tabIndex={!alert.seen ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!alert.seen && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onMarkSeen(alert.id);
                  }
                }}
                aria-label={!alert.seen ? `Marcar alerta de ${alert.patientName} como vista` : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-dark truncate">{alert.patientName}</p>
                    <p className="mt-0.5 text-xs text-gray-text">{alert.type}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      badge.classes,
                    )}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-text line-clamp-2">{alert.description}</p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(alert.createdAt)}
                  </span>

                  {!alert.resolved && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(alert.id);
                      }}
                      className={cn(
                        'rounded-xl bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white',
                        'transition-colors hover:opacity-90',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
                      )}
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </article>
            );
          })}
      </div>

      {/* ── Mobile tab bar ────────────────────────────────────── */}
      <DoctorTabBar activeTab="alerts" isScientificCommittee={isScientificCommittee} />
    </div>
  );
}
