'use client';

import { ArrowLeft, ClipboardList } from 'lucide-react';
import { CaregiverTabBar } from './CaregiverTabBar';
import { Button } from '@/presentation/ui/Button';
import type { MedicationLog } from '@/domain/caregiver/caregiver.types';

interface MedicationHistoryScreenProps {
  medicationName?: string;
  logs: MedicationLog[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  onBack: () => void;
}

export function MedicationHistoryScreen({
  medicationName,
  logs,
  isLoading,
  isError,
  error,
  onReload,
  onBack,
}: MedicationHistoryScreenProps) {
  return (
    <>
      <main className="flex flex-1 flex-col px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-text hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </button>

        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-dark mb-1">
          Historial de tomas
        </h1>
        {medicationName && (
          <p className="mb-6 text-sm text-gray-text">{medicationName}</p>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-3 w-48 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div
            role="alert"
            className="rounded-2xl border border-error-light bg-error-light px-4 py-4"
          >
            <p className="mb-3 text-sm font-medium text-error">
              {error ?? 'Error al cargar el historial.'}
            </p>
            <Button variant="primary" size="sm" onClick={onReload}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && logs.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <ClipboardList className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm font-semibold text-brand-dark">
              Sin tomas registradas
            </p>
            <p className="text-xs text-gray-400">
              Las tomas registradas aparecerán aquí
            </p>
          </div>
        )}

        {/* Log list */}
        {!isLoading && !isError && logs.length > 0 && (
          <div className="rounded-2xl border border-gray-200 shadow-sm px-4 divide-y divide-gray-100">
            {logs.map((log) => {
              const date = new Date(log.takenAt);
              const dateStr = new Intl.DateTimeFormat('es-CO', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }).format(date);
              const timeStr = new Intl.DateTimeFormat('es-CO', {
                hour: 'numeric',
                minute: '2-digit',
              }).format(date);

              return (
                <div key={log.id} className="flex items-start gap-3 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-light text-success text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">
                      {dateStr} · {timeStr}
                    </p>
                    {log.notes && (
                      <p className="mt-0.5 text-xs text-gray-text">{log.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CaregiverTabBar activeTab="meds" />
    </>
  );
}
