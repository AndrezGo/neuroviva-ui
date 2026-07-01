'use client';

import { DoctorShell } from '@/presentation/layout/DoctorShell';
import { DoctorCuratoriaScreen } from '@/presentation/doctor/DoctorCuratoriaScreen';

/**
 * Doctor curaduría page — stub for scientific committee members.
 * The tab is hidden in the nav when isScientificCommittee is false,
 * but the route still renders the stub if navigated to directly.
 * isScientificCommittee is hardcoded false for MVP.
 */
export default function DoctorCuraduriaPage() {
  const isScientificCommittee = false;

  return (
    <DoctorShell activeTab="curation" isScientificCommittee={isScientificCommittee}>
      <DoctorCuratoriaScreen isScientificCommittee={isScientificCommittee} />
    </DoctorShell>
  );
}
