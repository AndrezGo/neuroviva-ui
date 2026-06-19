'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverOnboarding, TOTAL_STEPS } from '@/application/onboarding/useCaregiverOnboarding';
import { OnboardingHeader } from '@/presentation/ui/OnboardingHeader';
import { Button } from '@/presentation/ui/Button';
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
    patientName,
    setPatientName,
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
        {step === 1 && (
          <StepPatient
            patientName={patientName}
            onPatientNameChange={setPatientName}
            relation={relation}
            onRelationChange={setRelation}
          />
        )}

        {step === 2 && (
          <StepCondition
            conditions={conditions}
            onConditionsChange={setConditions}
          />
        )}

        {step === 3 && (
          <StepReading
            largeText={largeText}
            onLargeTextChange={setLargeText}
            highContrast={highContrast}
            onHighContrastChange={setHighContrast}
          />
        )}

        {step === 4 && <StepReminders />}

        {isDone && (
          <StepDone
            userName={userName}
            patientName={patientName}
            onFinish={finish}
          />
        )}
      </div>

      {/* Footer — fixed at bottom; hidden on step 5 (CTA is inside StepDone) */}
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
