'use client';

import { useState, useCallback } from 'react';
import { Activity } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';
import { Sheet } from '@/presentation/ui/Sheet';
import { CaregiverTabBar } from './CaregiverTabBar';
import { RegisterSymptomSheet } from './RegisterSymptomSheet';
import { cn } from '@/shared/lib/cn';
import type { Symptom } from '@/domain/caregiver/caregiver.types';

// ── Module-scope helpers ──────────────────────────────────────────────────────

const SYMPTOM_LABELS: Record<string, string> = {
  agitacion: 'Agitación',
  apetito: 'Apetito',
  memoria: 'Memoria',
  sueno: 'Sueño',
  movilidad: 'Movilidad',
  dolor: 'Dolor',
  confusion: 'Confusión',
  ansiedad: 'Ansiedad',
  otro: 'Otro',
};

function intensityBadgeClasses(intensity: number): string {
  if (intensity <= 3) return 'bg-success-light text-success';
  if (intensity <= 6) return 'bg-amber-100 text-amber-700';
  return 'bg-error-light text-error';
}

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) return 'Hoy';
  if (target.getTime() === yesterday.getTime()) return 'Ayer';

  return `${date.getDate()} ${MONTHS_ES[date.getMonth()]}`;
}

// ── SymptomListItem ───────────────────────────────────────────────────────────

interface SymptomListItemProps {
  symptom: Symptom;
  onEdit: (symptom: Symptom) => void;
  onDelete: (id: string) => Promise<boolean>;
  isDeleting: boolean;
}

function SymptomListItem({ symptom, onEdit, onDelete, isDeleting }: SymptomListItemProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteConfirm = useCallback(async () => {
    const ok = await onDelete(symptom.id);
    if (ok) setDeleteConfirmOpen(false);
  }, [onDelete, symptom.id]);

  return (
    <>
      <li className="py-4 border-b border-gray-100 last:border-b-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">

          {/* Identity zone: icon + info */}
          <div className="flex flex-1 min-w-0 items-start gap-3">
            {/* Icon */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary"
              aria-hidden="true"
            >
              <Activity className="h-5 w-5" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-brand-dark">
                  {SYMPTOM_LABELS[symptom.type] ?? symptom.type}
                </p>
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                    intensityBadgeClasses(symptom.intensity),
                  )}
                >
                  Intensidad {symptom.intensity}
                </span>
              </div>
              <p className="text-xs text-gray-text">
                {formatRelativeDate(symptom.loggedAt)}
              </p>
              {symptom.description && (
                <p className="mt-1 text-xs text-gray-text line-clamp-2">
                  {symptom.description}
                </p>
              )}
            </div>
          </div>

          {/* Action zone */}
          <div className="flex gap-2 sm:w-auto sm:shrink-0">
            <button
              type="button"
              onClick={() => onEdit(symptom)}
              aria-label={`Editar síntoma ${SYMPTOM_LABELS[symptom.type] ?? symptom.type}`}
              className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold text-brand-dark border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 sm:flex-none"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              aria-label={`Eliminar síntoma ${SYMPTOM_LABELS[symptom.type] ?? symptom.type}`}
              className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-semibold text-error border border-error-light bg-error-light hover:bg-error-light/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 sm:flex-none"
            >
              Eliminar
            </button>
          </div>
        </div>
      </li>

      <Sheet
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Eliminar síntoma"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-text">
            ¿Estás seguro que quieres eliminar el síntoma{' '}
            <span className="font-semibold text-brand-dark">
              {SYMPTOM_LABELS[symptom.type] ?? symptom.type}
            </span>
            ? Se conservará en el historial médico.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="md"
              fullWidth
              isLoading={isDeleting}
              onClick={handleDeleteConfirm}
            >
              Eliminar
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              disabled={isDeleting}
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface CaregiverSymptomsScreenProps {
  symptoms: Symptom[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  onRegister: () => void;
  registerSheetOpen: boolean;
  onCloseRegister: () => void;
  onSaveSymptom: (type: string, intensity: number, description?: string) => void;
  isSaving: boolean;
  saveError: string | null;
  onClearSaveError: () => void;
  onEdit: (symptom: Symptom) => void;
  onDelete: (id: string) => Promise<boolean>;
  deletingId: string | null;
  deleteError: string | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Pure UI screen for the Caregiver Síntomas tab.
 * All data and handlers come from props; this component holds no API hooks.
 */
export function CaregiverSymptomsScreen({
  symptoms,
  isLoading,
  isError,
  error,
  onReload,
  onRegister,
  registerSheetOpen,
  onCloseRegister,
  onSaveSymptom,
  isSaving,
  saveError,
  onClearSaveError,
  onEdit,
  onDelete,
  deletingId,
  deleteError,
}: CaregiverSymptomsScreenProps) {
  const isEmpty = !isLoading && !isError && symptoms.length === 0;

  return (
    <>
      <main className="flex flex-1 flex-col px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-dark mb-6">
          Síntomas
        </h1>

        {/* Error panel */}
        {isError && (
          <div
            role="alert"
            className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-4"
          >
            <p className="mb-3 text-sm font-medium text-error">
              {error ?? 'Ocurrió un error al cargar los síntomas.'}
            </p>
            <Button variant="primary" size="sm" onClick={onReload}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Delete error banner */}
        {deleteError && (
          <div role="alert" className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-3">
            <p className="text-sm font-medium text-error">{deleteError}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div
            className="space-y-0 divide-y divide-gray-100"
            aria-busy="true"
            aria-label="Cargando síntomas"
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
              <Activity className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-brand-dark">
              Sin síntomas registrados
            </p>
            <p className="max-w-xs text-sm text-gray-text">
              Registra el primer síntoma para llevar un seguimiento de la evolución del paciente.
            </p>
            <Button variant="primary" size="md" onClick={onRegister} className="mt-2">
              Registrar primer síntoma
            </Button>
          </div>
        )}

        {/* Populated list */}
        {!isLoading && !isEmpty && (
          <ul
            aria-label="Lista de síntomas"
            className="mb-4 rounded-2xl border border-gray-200 shadow-sm px-4"
          >
            {symptoms.map((symptom) => (
              <SymptomListItem
                key={symptom.id}
                symptom={symptom}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingId === symptom.id}
              />
            ))}
          </ul>
        )}

        {/* Bottom CTA — only visible when list is populated */}
        {!isLoading && !isEmpty && !isError && (
          <div className="mt-4">
            <Button variant="primary" size="md" fullWidth onClick={onRegister}>
              Registrar síntoma
            </Button>
          </div>
        )}
      </main>

      <CaregiverTabBar activeTab="symptoms" />

      <RegisterSymptomSheet
        open={registerSheetOpen}
        isSaving={isSaving}
        error={saveError}
        onClose={onCloseRegister}
        onSave={onSaveSymptom}
        onClearError={onClearSaveError}
      />
    </>
  );
}
