'use client';

import { useDoctorPatients } from '@/application/doctor/useDoctorPatients';
import { DoctorShell } from '@/presentation/layout/DoctorShell';
import { DoctorPatientsScreen } from '@/presentation/doctor/DoctorPatientsScreen';

/**
 * Doctor home page — patient list.
 * All data fetching is delegated to useDoctorPatients; UI is in DoctorPatientsScreen.
 * isScientificCommittee is hardcoded false for MVP (no auth refactor needed).
 */
export default function DoctorHomePage() {
  const isScientificCommittee = false;

  const { patients, isLoading, isError, error, reload } = useDoctorPatients();

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
