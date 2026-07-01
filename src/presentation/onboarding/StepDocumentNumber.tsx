'use client';

import { useId } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { BirthDateSelect } from '@/presentation/ui/BirthDateSelect';
import type { PatientLookupStatus } from '@/application/caregiver/usePatientLookup';

interface StepDocumentNumberProps {
  documentNumber: string;
  onDocumentNumberChange: (doc: string) => void;
  patientName: string;
  onPatientNameChange: (name: string) => void;
  patientDateOfBirth: string | null;
  onPatientDateOfBirthChange: (dob: string | null) => void;
  lookupStatus: PatientLookupStatus;
  foundPatientName: string | null;
  errorMessage: string | null;
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-gray-400/60 transition-all duration-200 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark disabled:cursor-not-allowed disabled:opacity-60';

export function StepDocumentNumber({
  documentNumber,
  onDocumentNumberChange,
  patientName,
  onPatientNameChange,
  patientDateOfBirth,
  onPatientDateOfBirthChange,
  lookupStatus,
  foundPatientName,
  errorMessage,
}: StepDocumentNumberProps) {
  const docId = useId();
  const nameId = useId();
  const statusId = useId();

  const isFound = lookupStatus === 'found';

  return (
    <section className="flex flex-col gap-6 px-4 pt-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          ¿Cuál es el documento del paciente?
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Buscaremos si ya tiene un perfil en NeuroViva para conectar su historial.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Document number input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={docId} className="text-sm font-semibold text-gray-300 tracking-tight">
            Número de documento
          </label>
          <input
            id={docId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={documentNumber}
            onChange={(e) => onDocumentNumberChange(e.target.value)}
            placeholder="Ej. 12345678"
            aria-describedby={statusId}
            className={INPUT_CLASS}
          />
        </div>

        {/* Lookup status zone — aria-live so screen readers announce updates */}
        <div id={statusId} aria-live="polite" className="min-h-[1.5rem]">
          {lookupStatus === 'searching' && (
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Buscando...
            </span>
          )}

          {lookupStatus === 'found' && foundPatientName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Paciente encontrado: {foundPatientName}
            </span>
          )}

          {lookupStatus === 'not-found' && (
            <p className="text-sm text-gray-400">
              Se creará un nuevo perfil para este paciente.
            </p>
          )}

          {lookupStatus === 'error' && errorMessage && (
            <p role="alert" className="text-sm font-medium text-red-400">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Patient name field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={nameId} className="text-sm font-semibold text-gray-300 tracking-tight">
            Nombre del paciente
          </label>
          {isFound ? (
            <>
              <input
                id={nameId}
                type="text"
                readOnly
                disabled
                value={foundPatientName ?? patientName}
                className={INPUT_CLASS}
                aria-describedby={`${nameId}-hint`}
              />
              <p id={`${nameId}-hint`} className="text-xs text-gray-400">
                Nombre tomado del registro del paciente en NeuroViva.
              </p>
            </>
          ) : (
            <input
              id={nameId}
              type="text"
              autoComplete="off"
              value={patientName}
              onChange={(e) => onPatientNameChange(e.target.value)}
              placeholder="Ej. Carmen"
              className={INPUT_CLASS}
            />
          )}
        </div>

        {/* Date of birth — only shown when creating a new patient */}
        {!isFound && (
          <BirthDateSelect
            value={patientDateOfBirth}
            onChange={onPatientDateOfBirthChange}
            variant="dark"
            label="Fecha de nacimiento del paciente"
            optional
          />
        )}
      </div>
    </section>
  );
}
