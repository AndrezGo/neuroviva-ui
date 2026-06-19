'use client';

import { useState, useCallback } from 'react';
import { Pill } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';
import { CaregiverTabBar } from './CaregiverTabBar';
import { cn } from '@/shared/lib/cn';
import type { Medication } from '@/domain/caregiver/caregiver.types';

// ── MedicationListItem ────────────────────────────────────────────────────────

interface MedicationListItemProps {
  medication: Medication;
  onLog: (id: string) => Promise<boolean>;
  isLogging: boolean;
}

function MedicationListItem({ medication, onLog, isLogging }: MedicationListItemProps) {
  const [justLogged, setJustLogged] = useState(false);

  const handleLog = useCallback(async () => {
    const success = await onLog(medication.id);
    if (success) {
      setJustLogged(true);
      setTimeout(() => setJustLogged(false), 2500);
    }
  }, [onLog, medication.id]);

  return (
    <li className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-b-0">
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary"
        aria-hidden="true"
      >
        <Pill className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-brand-dark">{medication.name}</p>
        <p className="truncate text-xs text-gray-text">
          {medication.dose} · {medication.frequency}
        </p>
        <span
          className={cn(
            'mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
            medication.active
              ? 'bg-success-light text-success'
              : 'bg-gray-100 text-gray-text',
          )}
        >
          {medication.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Action */}
      <div className="shrink-0">
        {justLogged ? (
          <span className="inline-flex items-center rounded-full bg-success-light px-2.5 py-1 text-xs font-medium text-success">
            Toma registrada
          </span>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            isLoading={isLogging}
            onClick={handleLog}
            aria-label={`Registrar toma de ${medication.name}`}
          >
            Registrar toma
          </Button>
        )}
      </div>
    </li>
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
  onLog: (id: string) => Promise<boolean>;
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
  loggingId,
  logError,
}: CaregiverMedicationsScreenProps) {
  const isEmpty = !isLoading && !isError && medications.length === 0;

  return (
    <>
      <main className="flex flex-1 flex-col px-5 pt-6 pb-28">
        <h1 className="text-2xl font-black tracking-tight text-brand-dark mb-6">
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

        {/* Populated list */}
        {!isLoading && !isEmpty && (
          <ul aria-label="Lista de medicamentos" className="mb-4">
            {medications.map((med) => (
              <MedicationListItem
                key={med.id}
                medication={med}
                onLog={onLog}
                isLogging={loggingId === med.id}
              />
            ))}
          </ul>
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
