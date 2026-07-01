'use client';

import { usePatientOnboarding } from '@/application/onboarding/usePatientOnboarding';
import { PatientOnboardingScreen } from '@/presentation/onboarding/PatientOnboardingScreen';

export default function PatientOnboardingPage() {
  const {
    documentNumber,
    setDocumentNumber,
    canContinue,
    isLoading,
    error,
    finish,
  } = usePatientOnboarding();

  return (
    <PatientOnboardingScreen
      documentNumber={documentNumber}
      onDocumentNumberChange={setDocumentNumber}
      canContinue={canContinue}
      isLoading={isLoading}
      error={error}
      onFinish={finish}
    />
  );
}
