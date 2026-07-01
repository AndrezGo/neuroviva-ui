'use client';

import { useDoctorAlerts } from '@/application/doctor/useDoctorAlerts';
import { DoctorShell } from '@/presentation/layout/DoctorShell';
import { DoctorAlertsScreen } from '@/presentation/doctor/DoctorAlertsScreen';

/**
 * Doctor alerts page.
 * All data fetching and mutations are delegated to useDoctorAlerts.
 * isScientificCommittee is hardcoded false for MVP.
 */
export default function DoctorAlertasPage() {
  const isScientificCommittee = false;

  const { alerts, isLoading, isError, error, reload, markSeen, resolve } = useDoctorAlerts();

  return (
    <DoctorShell activeTab="alerts" isScientificCommittee={isScientificCommittee}>
      <DoctorAlertsScreen
        alerts={alerts}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        onMarkSeen={markSeen}
        onResolve={resolve}
        isScientificCommittee={isScientificCommittee}
      />
    </DoctorShell>
  );
}
