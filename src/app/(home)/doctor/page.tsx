'use client';

import { useDoctorPatients } from '@/application/doctor/useDoctorPatients';
import { useDoctorOnboardingGuard } from '@/application/doctor/useDoctorOnboardingGuard';
import { DoctorShell } from '@/presentation/layout/DoctorShell';
import { DoctorPatientsScreen } from '@/presentation/doctor/DoctorPatientsScreen';

/**
 * Doctor home page — patient list.
 * All data fetching is delegated to useDoctorPatients; UI is in DoctorPatientsScreen.
 * isScientificCommittee is hardcoded false for MVP (no auth refactor needed).
 */
export default function DoctorHomePage() {
  const { isChecking } = useDoctorOnboardingGuard();

  const isScientificCommittee = false;

  const { patients, isLoading, isError, error, reload } = useDoctorPatients();

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <DoctorShell activeTab="patients" isScientificCommittee={isScientificCommittee}>
      <DoctorPatientsScreen
        patients={patients}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        isScientificCommittee={isScientificCommittee}
      />
    </DoctorShell>
  );
}
