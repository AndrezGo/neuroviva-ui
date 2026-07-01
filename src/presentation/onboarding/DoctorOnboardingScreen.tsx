'use client';

import { useId } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingHeader } from '@/presentation/ui/OnboardingHeader';
import { Button } from '@/presentation/ui/Button';
import { routes } from '@/core/routing/routes';
import type { UseDoctorOnboardingReturn } from '@/application/onboarding/useDoctorOnboarding';

const SPECIALTY_OPTIONS = [
  { value: 'neurologia', label: 'Neurología' },
  { value: 'psiquiatria', label: 'Psiquiatría' },
  { value: 'geriatria', label: 'Geriatría' },
  { value: 'neuropsicologia', label: 'Neuropsicología' },
  { value: 'medicina_interna', label: 'Medicina Interna' },
  { value: 'medicina_familiar', label: 'Medicina Familiar' },
  { value: 'other', label: 'Otra' },
] as const;

const INPUT_CLASS =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-gray-400/60 transition-all duration-200 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark';

const SELECT_CLASS =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-base text-white transition-all duration-200 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark appearance-none';

const LABEL_CLASS = 'text-sm font-semibold text-gray-300 tracking-tight';

export function DoctorOnboardingScreen({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  specialty,
  setSpecialty,
  isOtherSpecialty,
  customSpecialty,
  setCustomSpecialty,
  medicalLicense,
  setMedicalLicense,
  canSubmit,
  isSubmitting,
  error,
  finish,
}: UseDoctorOnboardingReturn) {
  const router = useRouter();
  const firstNameId = useId();
  const lastNameId = useId();
  const specialtyId = useId();
  const customSpecialtyId = useId();
  const medicalLicenseId = useId();

  function handleBack() {
    router.push(routes.roleSelection());
  }

  return (
    <div className="flex flex-1 flex-col">
      <OnboardingHeader
        onBack={handleBack}
        progress={100}
        currentStep={1}
        totalSteps={1}
        hideSkip
      />

      <div className="flex flex-1 flex-col justify-between px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Title block */}
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">
              Completa tu perfil profesional
            </h1>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Estos datos habilitan tu panel clínico.
            </p>
          </div>

          {/* First name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={firstNameId} className={LABEL_CLASS}>
              Nombre(s)
            </label>
            <input
              id={firstNameId}
              type="text"
              autoComplete="off"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ej. María"
              aria-required="true"
              className={INPUT_CLASS}
            />
          </div>

          {/* Last name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={lastNameId} className={LABEL_CLASS}>
              Apellido(s)
            </label>
            <input
              id={lastNameId}
              type="text"
              autoComplete="off"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ej. García"
              aria-required="true"
              className={INPUT_CLASS}
            />
          </div>

          {/* Specialty select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={specialtyId} className={LABEL_CLASS}>
              Especialidad
            </label>
            <select
              id={specialtyId}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              aria-required="true"
              className={SELECT_CLASS}
            >
              <option value="" disabled className="bg-brand-dark text-gray-400">
                Selecciona una especialidad
              </option>
              {SPECIALTY_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-brand-dark text-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Free-text specialty — shown only when "Otra" is selected */}
          {isOtherSpecialty && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={customSpecialtyId} className={LABEL_CLASS}>
                Especifica tu especialidad
              </label>
              <input
                id={customSpecialtyId}
                type="text"
                autoComplete="off"
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                placeholder="Ej. Neurología pediátrica"
                aria-required="true"
                className={INPUT_CLASS}
              />
            </div>
          )}

          {/* Medical license */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={medicalLicenseId} className={LABEL_CLASS}>
              Cédula profesional
            </label>
            <input
              id={medicalLicenseId}
              type="text"
              autoComplete="off"
              value={medicalLicense}
              onChange={(e) => setMedicalLicense(e.target.value)}
              placeholder="Ej. 1234567"
              aria-required="true"
              aria-invalid={error ? 'true' : undefined}
              className={INPUT_CLASS}
            />
          </div>

          {/* Inline error */}
          {error !== null && (
            <p role="alert" aria-live="polite" className="text-sm font-medium text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSubmit || isSubmitting}
            isLoading={isSubmitting}
            onClick={finish}
          >
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
}
