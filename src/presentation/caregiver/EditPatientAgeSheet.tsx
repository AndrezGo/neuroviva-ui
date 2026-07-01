'use client';

import { useState, useEffect, useId } from 'react';
import { Sheet } from '@/presentation/ui/Sheet';
import { BirthDateSelect } from '@/presentation/ui/BirthDateSelect';
import { Button } from '@/presentation/ui/Button';

const CONDITION_OPTIONS = [
  { label: 'Alzheimer', value: 'alzheimer' },
  { label: 'Parkinson', value: 'parkinson' },
  { label: 'Demencia (DCL)', value: 'dementia_mci' },
  { label: 'ELA', value: 'als' },
  { label: 'Huntington', value: 'huntington' },
  { label: 'Otra', value: 'other' },
] as const;

/** Maps display names (from the Diseases catalog) to option slugs. */
const NAME_TO_SLUG: Record<string, string> = {
  alzheimer: 'alzheimer',
  parkinson: 'parkinson',
  'parkinson disease': 'parkinson',
  'demencia (dcl)': 'dementia_mci',
  'demencia mci': 'dementia_mci',
  dementia: 'dementia_mci',
  demencia: 'dementia_mci',
  ela: 'als',
  huntington: 'huntington',
  otra: 'other',
  other: 'other',
};

function resolveSlug(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return NAME_TO_SLUG[lower] ?? lower;
}

function resolveSlugs(raw: string[]): string[] {
  return raw.map(resolveSlug);
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-gray-400 transition-colors focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-60';

interface EditPatientBirthDateSheetProps {
  open: boolean;
  currentName: string;
  currentDateOfBirth?: string | null;
  currentConditions: string[];
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (name: string, dob: string | null, conditions: string[]) => void;
  onClearError?: () => void;
}

/**
 * Sheet for editing patient name, date of birth, and condition.
 * No API calls or stores — all orchestration delegated to parent via props.
 */
export function EditPatientBirthDateSheet({
  open,
  currentName,
  currentDateOfBirth,
  currentConditions,
  isSaving,
  error,
  onClose,
  onSave,
  onClearError,
}: EditPatientBirthDateSheetProps) {
  const nameId = useId();
  const conditionId = useId();

  const [localName, setLocalName] = useState(currentName);
  const [localIso, setLocalIso] = useState<string | null>(currentDateOfBirth ?? null);
  const [localConditions, setLocalConditions] = useState(() => resolveSlugs(currentConditions));
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLocalName(currentName);
      setLocalIso(currentDateOfBirth ?? null);
      setLocalConditions(resolveSlugs(currentConditions));
      setNameError(null);
    }
  }, [open, currentName, currentDateOfBirth, currentConditions]);

  function toggleCondition(value: string) {
    setLocalConditions((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
    onClearError?.();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!localName.trim()) {
      setNameError('El nombre no puede estar vacío.');
      return;
    }

    setNameError(null);
    onSave(localName.trim(), localIso, localConditions);
  }

  return (
    <Sheet open={open} onClose={onClose} title="Editar información del paciente">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 pt-2">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={nameId} className="text-sm font-semibold text-brand-dark">
            Nombre del paciente
          </label>
          <input
            id={nameId}
            type="text"
            autoComplete="off"
            value={localName}
            onChange={(e) => {
              setLocalName(e.target.value);
              setNameError(null);
              onClearError?.();
            }}
            placeholder="Ej. Carmen"
            className={INPUT_CLASS}
          />
          {nameError && (
            <p role="alert" className="text-xs font-medium text-red-500">
              {nameError}
            </p>
          )}
        </div>

        {/* Date of birth */}
        <BirthDateSelect
          value={localIso}
          onChange={(iso) => {
            setLocalIso(iso);
            onClearError?.();
          }}
          variant="light"
          label="Fecha de nacimiento"
          optional
        />

        {/* Condition — multi-select: a patient can have more than one condition */}
        <div className="flex flex-col gap-1.5">
          <span id={conditionId} className="text-sm font-semibold text-brand-dark">
            Condición
          </span>
          <div
            role="group"
            aria-labelledby={conditionId}
            className="flex flex-wrap gap-2"
          >
            {CONDITION_OPTIONS.map((opt) => {
              const selected = localConditions.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => toggleCondition(opt.value)}
                  className={`inline-flex items-center justify-center rounded-full border-2 px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                    selected
                      ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-text hover:border-brand-primary/60 hover:bg-brand-primary-light'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-error-light bg-error-light px-4 py-3 text-sm font-medium text-error"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving} fullWidth>
            Guardar cambios
          </Button>
          <Button type="button" variant="secondary" size="md" onClick={onClose} fullWidth>
            Cancelar
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
