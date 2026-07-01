'use client';

import { DoctorTabBar } from './DoctorTabBar';

interface DoctorCuratoriaScreenProps {
  isScientificCommittee?: boolean;
}

/**
 * Stub screen for the Doctor Curaduría tab.
 * Only accessible to scientific committee members (isScientificCommittee = true).
 * The tab itself is hidden in the nav when the flag is false, but the route
 * renders this stub if navigated to directly — which is intentional for MVP.
 */
export function DoctorCuratoriaScreen({
  isScientificCommittee = false,
}: DoctorCuratoriaScreenProps) {
  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
        <p className="text-xl font-bold text-brand-dark">Curaduría</p>
        <p className="text-sm text-gray-text">Próximamente</p>
      </div>

      <DoctorTabBar activeTab="curation" isScientificCommittee={isScientificCommittee} />
    </div>
  );
}
