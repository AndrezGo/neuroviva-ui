'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverOnboarding, TOTAL_STEPS } from '@/application/onboarding/useCaregiverOnboarding';
import { OnboardingHeader } from '@/presentation/ui/OnboardingHeader';
import { Button } from '@/presentation/ui/Button';
import { StepDocumentNumber } from '@/presentation/onboarding/StepDocumentNumber';
import { StepPatient } from '@/presentation/onboarding/StepPatient';
import { StepCondition } from '@/presentation/onboarding/StepCondition';
import { StepReading } from '@/presentation/onboarding/StepReading';
import { StepReminders } from '@/presentation/onboarding/StepReminders';
import { StepDone } from '@/presentation/onboarding/StepDone';
import { routes } from '@/core/routing/routes';

export default function CaregiverOnboardingPage() {
  const router = useRouter();

  const {
    step,
    progress,
    goNext,
    goBack,
    skip,
    finish,
    canContinue,
    documentNumber,
    setDocumentNumber,
    patientName,
    setPatientName,
    patientDateOfBirth,
    setPatientDateOfBirth,
    relation,
    setRelation,
    conditions,
    setConditions,
    largeText,
    highContrast,
    setLargeText,
    setHighContrast,
    userName,
    onboardingCompleted,
    lookupStatus,
    lookupPatient,
    lookupErrorMessage,
  } = useCaregiverOnboarding();

  // Redirect to caregiver home if onboarding was already completed
  useEffect(() => {
    if (onboardingCompleted) router.replace(routes.homeCaregiver());
  }, [onboardingCompleted, router]);

  // Prevent flash of wizard while redirect is in-flight
  if (onboardingCompleted) return null;

  const isDone = step === TOTAL_STEPS;

  return (
    <div className="flex flex-1 flex-col">
      {/* Wizard chrome — always visible */}
      <OnboardingHeader
        onBack={goBack}
        onSkip={skip}
        progress={progress}
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        hideSkip={isDone}
      />

      {/* Step content — grows to fill available space */}
      <div className="flex-1">
        {/* Step 1 — document number + patient lookup */}
        {step === 1 && (
          <StepDocumentNumber
            documentNumber={documentNumber}
            onDocumentNumberChange={setDocumentNumber}
            patientName={patientName}
            onPatientNameChange={setPatientName}
            patientDateOfBirth={patientDateOfBirth}
            onPatientDateOfBirthChange={setPatientDateOfBirth}
            lookupStatus={lookupStatus}
            foundPatientName={lookupPatient?.name ?? null}
            errorMessage={lookupErrorMessage}
          />
        )}

        {/* Step 2 — relation */}
        {step === 2 && (
          <StepPatient
            relation={relation}
            onRelationChange={setRelation}
          />
        )}

        {/* Step 3 — condition */}
        {step === 3 && (
          <StepCondition
            conditions={conditions}
            onConditionsChange={setConditions}
          />
        )}

        {/* Step 4 — reading preferences */}
        {step === 4 && (
          <StepReading
            largeText={largeText}
            onLargeTextChange={setLargeText}
            highContrast={highContrast}
            onHighContrastChange={setHighContrast}
          />
        )}

        {/* Step 5 — reminders */}
        {step === 5 && <StepReminders />}

        {/* Step 6 — done */}
        {isDone && (
          <StepDone
            userName={userName}
            patientName={patientName}
            onFinish={finish}
          />
        )}
      </div>

      {/* Footer — fixed at bottom; hidden on last step (CTA is inside StepDone) */}
      {!isDone && (
        <div className="sticky bottom-0 px-4 pb-6 pt-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canContinue}
            onClick={goNext}
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
}
