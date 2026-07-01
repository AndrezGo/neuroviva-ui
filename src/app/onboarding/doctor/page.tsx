'use client';

import { useDoctorOnboarding } from '@/application/onboarding/useDoctorOnboarding';
import { DoctorOnboardingScreen } from '@/presentation/onboarding/DoctorOnboardingScreen';

export default function DoctorOnboardingPage() {
  const hook = useDoctorOnboarding();

  // Anti-flash guard: if already completed, the hook's useEffect will redirect;
  // return null to avoid rendering the form for a single frame.
  if (hook.onboardingCompleted) return null;

  return <DoctorOnboardingScreen {...hook} />;
}
