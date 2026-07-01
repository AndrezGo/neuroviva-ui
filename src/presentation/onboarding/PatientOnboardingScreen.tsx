'use client';

import { useId } from 'react';
import { Button } from '@/presentation/ui/Button';

interface PatientOnboardingScreenProps {
  documentNumber: string;
  onDocumentNumberChange: (doc: string) => void;
  canContinue: boolean;
  isLoading: boolean;
  error: string | null;
  onFinish: () => void;
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-gray-400/60 transition-all duration-200 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark';

export function PatientOnboardingScreen({
  documentNumber,
  onDocumentNumberChange,
  canContinue,
  isLoading,
  error,
  onFinish,
}: PatientOnboardingScreenProps) {
  const inputId = useId();

  return (
    <div className="flex flex-1 flex-col justify-between px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">
            Vincula tu cuenta
          </h1>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            Ingresa tu número de documento para conectarte con tu información médica y comenzar tu experiencia en NeuroViva.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gray-300 tracking-tight"
          >
            Número de documento
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={documentNumber}
            onChange={(e) => onDocumentNumberChange(e.target.value)}
            placeholder="Ej. 12345678"
            aria-invalid={error ? 'true' : undefined}
            className={INPUT_CLASS}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-400">
            {error}
          </p>
        )}
      </div>

      <div className="pt-6">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue || isLoading}
          isLoading={isLoading}
          onClick={onFinish}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
