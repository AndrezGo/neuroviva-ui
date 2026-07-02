'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Pill, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';
import { CaregiverTabBar } from './CaregiverTabBar';
import { cn } from '@/shared/lib/cn';
import { LogIntakeSheet } from './LogIntakeSheet';
import type { Medication } from '@/domain/caregiver/caregiver.types';

const PAGE_SIZE = 3;

// ── MedicationListItem ────────────────────────────────────────────────────────

interface MedicationListItemProps {
  medication: Medication;
  onLog: (id: string, notes?: string) => Promise<boolean>;
  onViewHistory: (id: string) => void;
  isLogging: boolean;
}

function MedicationListItem({
  medication,
  onLog,
  onViewHistory,
  isLogging,
}: MedicationListItemProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleConfirm = useCallback(
    async (notes?: string) => {
      await onLog(medication.id, notes);
      setSheetOpen(false);
    },
    [onLog, medication.id],
  );

  return (
    <>
      <li className="py-4 border-b border-gray-100 last:border-b-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">

          {/* Identity zone: icon + name/dose/badges */}
          <div className="flex flex-1 min-w-0 items-start gap-3">
            {/* Icon tile */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary"
              aria-hidden="true"
            >
              <Pill className="h-5 w-5" />
            </div>

            {/* Info block */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-dark text-pretty break-words">
                {medication.name}
              </p>

              <p className="mt-0.5 text-xs text-gray-text break-words">
                {medication.dose} · {medication.frequency}
              </p>

              {/* Badge row */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {medication.takenToday === true && (
                  <span className="bg-success-light text-success text-xs font-semibold px-2 py-0.5 rounded-full">
                    Tomada hoy
                  </span>
                )}

                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                    medication.active
                      ? 'bg-success-light text-success'
                      : 'bg-gray-100 text-gray-text',
                  )}
                >
                  {medication.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Action zone */}
          <div className="flex flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={() => onViewHistory(medication.id)}
              className="self-start inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold text-brand-primary border border-brand-primary/25 bg-brand-primary-light hover:bg-brand-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 sm:self-auto sm:w-auto"
            >
              Ver historial
            </button>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              isLoading={isLogging}
              onClick={() => setSheetOpen(true)}
              aria-label={`Registrar toma de ${medication.name}`}
              className="sm:w-auto"
            >
              Registrar toma
            </Button>
          </div>
        </div>
      </li>

      <LogIntakeSheet
        open={sheetOpen}
        medicationName={medication.name}
        isSubmitting={isLogging}
        onClose={() => setSheetOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

// ── CaregiverMedicationsScreen ────────────────────────────────────────────────

interface CaregiverMedicationsScreenProps {
  medications: Medication[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  onAdd: () => void;
  onLog: (id: string, notes?: string) => Promise<boolean>;
  onViewHistory: (id: string) => void;
  loggingId: string | null;
  logError: string | null;
}

/**
 * Pure UI screen for the Caregiver Medicinas tab.
 * All data and handlers come from props; this component holds no hooks.
 */
export function CaregiverMedicationsScreen({
  medications,
  isLoading,
  isError,
  error,
  onReload,
  onAdd,
  onLog,
  onViewHistory,
  loggingId,
  logError,
}: CaregiverMedicationsScreenProps) {
  const isEmpty = !isLoading && !isError && medications.length === 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const filteredMedications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return medications;
    return medications.filter((med) => med.name.toLowerCase().includes(query));
  }, [medications, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMedications.length / PAGE_SIZE));

  // Keep the current page in range whenever the filtered list or page size changes
  // (e.g. a search narrows the results down to fewer pages than we're currently on).
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pagedMedications = filteredMedications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const noSearchResults = !isLoading && !isEmpty && filteredMedications.length === 0;

  return (
    <>
      <main className="flex flex-1 flex-col px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-dark mb-6">
          Medicamentos
        </h1>

        {/* Error panel */}
        {isError && (
          <div
            role="alert"
            className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-4"
          >
            <p className="mb-3 text-sm font-medium text-error">
              {error ?? 'Ocurrió un error al cargar los medicamentos.'}
            </p>
            <Button variant="primary" size="sm" onClick={onReload}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Log error banner */}
        {logError && (
          <div
            role="alert"
            className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-3"
          >
            <p className="text-sm font-medium text-error">{logError}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div
            className="space-y-0 divide-y divide-gray-100"
            aria-busy="true"
            aria-label="Cargando medicamentos"
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
              <Pill className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-brand-dark">
              Sin medicamentos registrados
            </p>
            <p className="max-w-xs text-sm text-gray-text">
              Agrega el primer medicamento para llevar un control del tratamiento.
            </p>
            <Button variant="primary" size="md" onClick={onAdd} className="mt-2">
              Agregar medicamento
            </Button>
          </div>
        )}

        {/* Search */}
        {!isLoading && !isEmpty && (
          <div className="relative mb-4">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar medicamento"
              aria-label="Buscar medicamento"
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-brand-dark placeholder:text-gray-400 transition-colors focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        )}

        {/* No search results */}
        {noSearchResults && (
          <div className="flex flex-col items-center gap-2 py-12 text-center animate-fade-up">
            <p className="text-sm font-semibold text-brand-dark">
              Sin resultados para "{searchQuery}"
            </p>
            <p className="text-xs text-gray-text">Intenta con otro nombre.</p>
          </div>
        )}

        {/* Populated list */}
        {!isLoading && !isEmpty && !noSearchResults && (
          <>
            <ul aria-label="Lista de medicamentos" className="mb-4 rounded-2xl border border-gray-200 shadow-sm px-4">
              {pagedMedications.map((med) => (
                <MedicationListItem
                  key={med.id}
                  medication={med}
                  onLog={onLog}
                  onViewHistory={onViewHistory}
                  isLogging={loggingId === med.id}
                />
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Página anterior"
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Anterior
                </button>

                <span className="text-xs font-medium text-gray-text">
                  Página {page} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Página siguiente"
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}

        {/* FAB-style primary CTA — only visible when list is populated */}
        {!isLoading && !isEmpty && (
          <div className="mt-4">
            <Button variant="primary" size="md" fullWidth onClick={onAdd}>
              Agregar medicamento
            </Button>
          </div>
        )}
      </main>

      <CaregiverTabBar activeTab="meds" />
    </>
  );
}
